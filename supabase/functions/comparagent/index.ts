import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

type Match = {
  bursary_id: string;
  bursary_name: string;
  provider: string | null;
  deadline: string | null;
  source_url: string | null;
  score: number;
  reasoning: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing Authorization" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!lovableKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: "Invalid auth" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: latest, error: latestErr } = await admin
    .from("given_bursary_info")
    .select("id, payload, summary")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestErr) {
    return new Response(JSON.stringify({ error: latestErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!latest) {
    return new Response(JSON.stringify({ error: "No bursary info found. Complete the quiz first." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: reqs, error: reqsErr } = await admin
    .from("bursary_requirements")
    .select("id, bursary_name, requirements, deadline, provider, source_url")
    .order("updated_at", { ascending: false })
    .limit(60);

  if (reqsErr) {
    return new Response(JSON.stringify({ error: reqsErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!reqs || reqs.length === 0) {
    return new Response(JSON.stringify({ matches: [], note: "No bursary requirements scraped yet." }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const aiBody = {
    model: "google/gemini-3-flash-preview",
    messages: [
      {
        role: "system",
        content:
          "You compare a South African student's profile with a list of bursary requirements. For EACH bursary, return a match score 0-100 and a one-sentence reasoning. Be strict: penalise wrong field of study, wrong nationality, wrong study level, marks below the minimum, or income above the cap.",
      },
      {
        role: "user",
        content: JSON.stringify({
          student_profile: latest.payload,
          student_summary: latest.summary,
          bursaries: reqs.map((r) => ({
            id: r.id,
            name: r.bursary_name,
            provider: r.provider,
            deadline: r.deadline,
            source_url: r.source_url,
            requirements: r.requirements,
          })),
        }),
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "rank_matches",
          description: "Return a ranked list of bursary matches with scores and reasoning.",
          parameters: {
            type: "object",
            properties: {
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    bursary_id: { type: "string" },
                    score: { type: "integer", minimum: 0, maximum: 100 },
                    reasoning: { type: "string" },
                  },
                  required: ["bursary_id", "score", "reasoning"],
                  additionalProperties: false,
                },
              },
            },
            required: ["matches"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "rank_matches" } },
  };

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(aiBody),
  });

  if (aiResp.status === 429) {
    return new Response(JSON.stringify({ error: "Rate limit hit on AI gateway. Try again shortly." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (aiResp.status === 402) {
    return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Lovable workspace." }), {
      status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!aiResp.ok) {
    const text = await aiResp.text();
    console.error("comparagent: AI error", aiResp.status, text);
    return new Response(JSON.stringify({ error: "AI gateway error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const aiJson = await aiResp.json();
  const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
  let parsed: { matches: Array<{ bursary_id: string; score: number; reasoning: string }> } = { matches: [] };
  try {
    parsed = JSON.parse(toolCall?.function?.arguments ?? "{}");
  } catch (_e) {
    // ignore
  }

  const reqMap = new Map(reqs.map((r) => [r.id, r]));
  const enriched: Match[] = (parsed.matches ?? [])
    .map((m) => {
      const r = reqMap.get(m.bursary_id);
      if (!r) return null;
      return {
        bursary_id: r.id,
        bursary_name: r.bursary_name,
        provider: r.provider,
        deadline: r.deadline,
        source_url: r.source_url,
        score: Math.max(0, Math.min(100, Math.round(m.score))),
        reasoning: m.reasoning?.slice(0, 500) ?? "",
      } as Match;
    })
    .filter((m): m is Match => m !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  await admin.from("comparagent_results").insert({
    user_id: userId,
    given_info_id: latest.id,
    matches: enriched as unknown as Record<string, unknown>[],
  });

  return new Response(JSON.stringify({ matches: enriched }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
