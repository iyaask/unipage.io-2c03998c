// Bursary discovery agent: scrapes SA bursary sources via Browserbase/Stagehand,
// structures them with Lovable AI (Gemini), and writes into public.bursaries
// (the same table the dashboard reads from).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Stagehand } from "npm:@browserbasehq/stagehand@2.5.0";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const;

const SOURCES = [
  { name: "ZA Bursaries", url: "https://www.zabursaries.co.za/latest-bursaries-south-africa/" },
  { name: "NSFAS", url: "https://www.nsfas.org.za/content/" },
  { name: "Bursaries Portal", url: "https://www.bursariesportal.co.za/bursaries/" },
];

const ScrapedBursary = z.object({
  name: z.string(),
  provider: z.string().nullable().optional(),
  amount: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  status: z.enum(["open", "closed", "unknown"]).optional(),
  eligibility_summary: z.string().nullable().optional(),
  fields_of_study: z.array(z.string()).optional(),
});

const PageSchema = z.object({
  bursaries: z.array(ScrapedBursary).max(40),
});

type Scraped = z.infer<typeof ScrapedBursary>;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const bbApiKey = Deno.env.get("BROWSERBASE_API_KEY");
  const bbProjectId = Deno.env.get("BROWSERBASE_PROJECT_ID");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  if (!bbApiKey || !bbProjectId) {
    return new Response(
      JSON.stringify({ error: "Missing BROWSERBASE_API_KEY or BROWSERBASE_PROJECT_ID" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
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
    let stagehand: Stagehand | null = null;
    try {
      stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: bbApiKey,
        projectId: bbProjectId,
        verbose: 0,
      });
      await stagehand.init();
      const page = stagehand.page;
      await page.goto(src.url, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(2_000);

      const bodyText = (await page.locator("body").innerText().catch(() => ""))
        .replace(/\s+/g, " ")
        .slice(0, 15_000);

      // Structure with Lovable AI (Gemini)
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                "Extract South African bursary opportunities from scraped page text. Return ONLY valid JSON matching this shape: {\"bursaries\":[{name, provider, amount, deadline, url, status:'open'|'closed'|'unknown', eligibility_summary, fields_of_study:string[]}]}. Use null for unknown scalars and [] for unknown arrays. Skip duplicates and obviously closed bursaries.",
            },
            {
              role: "user",
              content: `Source: ${src.name} (${src.url})\n\nPage text:\n${bodyText}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        throw new Error(`AI gateway ${aiRes.status}: ${errText.slice(0, 200)}`);
      }

      const aiJson = await aiRes.json();
      const content: string = aiJson?.choices?.[0]?.message?.content ?? "{}";
      const parsedRaw = JSON.parse(content);
      const parsed = PageSchema.safeParse(parsedRaw);
      const items: Scraped[] = parsed.success ? parsed.data.bursaries : [];

      const rows = items
        .filter((b) => b.name)
        .map((b) => ({
          name: b.name.slice(0, 300),
          provider: (b.provider ?? src.name).slice(0, 200),
          amount: b.amount ?? null,
          deadline: b.deadline ?? null,
          url: b.url ?? src.url,
          status: b.status ?? "unknown",
          eligibility: b.eligibility_summary ? { summary: b.eligibility_summary } : null,
          fields_of_study: b.fields_of_study ?? [],
        }));

      allRows.push(...rows);
      summary.push({ source: src.name, count: rows.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("extractor: source failed", { source: src.name, message });
      summary.push({ source: src.name, count: 0, error: message });
    } finally {
      try { await stagehand?.close(); } catch (_) { /* ignore */ }
    }
  }

  // Replace contents of bursaries with the latest run.
  let inserted = 0;
  if (allRows.length > 0) {
    await admin.from("bursaries").delete().not("id", "is", null);
    const { error: insertError, data } = await admin
      .from("bursaries")
      .insert(allRows)
      .select("id");
    if (insertError) {
      return new Response(
        JSON.stringify({ ok: false, error: insertError.message, summary }),
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
