// Bursary discovery agent: fetches SA bursary listing pages, structures them
// with Lovable AI (Gemini), and writes into public.bursaries (the table the
// dashboard reads from).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

const SOURCES = [
  { name: "ZA Bursaries", url: "https://www.zabursaries.co.za/latest-bursaries-south-africa/" },
  { name: "Bursaries Portal", url: "https://www.bursariesportal.co.za/bursaries/" },
  { name: "NSFAS", url: "https://www.nsfas.org.za/content/" },
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  if (!lovableKey) {
    return new Response(
      JSON.stringify({ error: "Missing LOVABLE_API_KEY" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const summary: Array<{ source: string; count: number; error?: string }> = [];
  const allRows: Array<Record<string, unknown>> = [];

  for (const src of SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: { "User-Agent": UA, Accept: "text/html" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const text = htmlToText(html).slice(0, 18_000);

      const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": lovableKey,
          "X-Lovable-AIG-SDK": "edge-fn-direct",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You extract South African bursary opportunities from scraped page text. " +
                "Return ONLY valid JSON of shape: " +
                '{"bursaries":[{"name":string,"provider":string|null,"amount":string|null,' +
                '"deadline":string|null,"url":string|null,' +
                '"status":"open"|"closed"|"unknown",' +
                '"eligibility_summary":string|null,"fields_of_study":string[]}]} . ' +
                "Use null for unknown scalars and [] for unknown arrays. Skip duplicates and obviously closed bursaries. Max 30 items.",
            },
            {
              role: "user",
              content: `Source: ${src.name} (${src.url})\n\nPage text:\n${text}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!ai.ok) {
        const errText = await ai.text();
        throw new Error(`AI ${ai.status}: ${errText.slice(0, 200)}`);
      }

      const aiJson = await ai.json();
      const content: string = aiJson?.choices?.[0]?.message?.content ?? "{}";
      let parsed: { bursaries?: Array<Record<string, unknown>> } = {};
      try { parsed = JSON.parse(content); } catch { parsed = {}; }
      const items = Array.isArray(parsed.bursaries) ? parsed.bursaries : [];

      const rows = items
        .filter((b) => typeof b.name === "string" && (b.name as string).trim().length > 0)
        .map((b) => ({
          name: String(b.name).slice(0, 300),
          provider: (b.provider ? String(b.provider) : src.name).slice(0, 200),
          amount: b.amount ? String(b.amount) : null,
          deadline: b.deadline ? String(b.deadline) : null,
          url: b.url ? String(b.url) : src.url,
          status:
            b.status === "open" || b.status === "closed" ? b.status : "unknown",
          eligibility: b.eligibility_summary
            ? { summary: String(b.eligibility_summary) }
            : null,
          fields_of_study: Array.isArray(b.fields_of_study)
            ? (b.fields_of_study as unknown[]).map((s) => String(s))
            : [],
        }));

      allRows.push(...rows);
      summary.push({ source: src.name, count: rows.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("extractor: source failed", src.name, message);
      summary.push({ source: src.name, count: 0, error: message });
    }
  }

  let inserted = 0;
  if (allRows.length > 0) {
    await admin.from("bursaries").delete().not("id", "is", null);
    const { data, error } = await admin.from("bursaries").insert(allRows).select("id");
    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message, summary }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    inserted = data?.length ?? 0;
  }

  return new Response(
    JSON.stringify({ ok: true, inserted, summary }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
