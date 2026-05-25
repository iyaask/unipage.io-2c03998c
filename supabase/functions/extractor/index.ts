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

const BursarySchema = z.object({
  bursaries: z
    .array(
      z.object({
        bursary_name: z.string(),
        requirements: z.string(),
        deadline: z.string().nullable().optional(),
        provider: z.string().nullable().optional(),
      })
    )
    .max(40),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startedAt = new Date().toISOString();
  console.log("extractor: started", { startedAt });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const apiKey = Deno.env.get("BROWSERBASE_API_KEY");
  const projectId = Deno.env.get("BROWSERBASE_PROJECT_ID");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey || !projectId || !openaiKey) {
    return new Response(
      JSON.stringify({ error: "Missing BROWSERBASE_API_KEY, BROWSERBASE_PROJECT_ID or OPENAI_API_KEY" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const summary: Array<{ source: string; count: number; error?: string }> = [];
  let totalUpserts = 0;

  for (const src of SOURCES) {
    let stagehand: Stagehand | null = null;
    try {
      stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey,
        projectId,
        modelName: "openai/gpt-4o-mini",
        modelClientOptions: { apiKey: openaiKey },
        verbose: 0,
      });
      await stagehand.init();
      const page = stagehand.page;
      await page.goto(src.url, { waitUntil: "domcontentloaded", timeout: 45_000 });
      // Best-effort: wait a moment for content to render
      await page.waitForTimeout(2_000);

      const extracted = await page.extract({
        instruction:
          "Extract every currently-open bursary or scholarship visible on this page. For each one return: bursary_name (the title), requirements (a one-paragraph plain-English summary of who can apply: study level, field of study, marks, nationality, income, and any other criteria), deadline (closing date as a string), and provider (the company or institution offering it). Skip closed bursaries.",
        schema: BursarySchema,
      });

      const rows = (extracted?.bursaries ?? [])
        .filter((b) => b.bursary_name && b.requirements)
        .map((b) => ({
          bursary_name: b.bursary_name.slice(0, 300),
          requirements: b.requirements.slice(0, 4000),
          deadline: b.deadline ?? null,
          provider: b.provider ?? src.name,
          source_url: src.url,
          raw: b as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        }));

      if (rows.length > 0) {
        const { error } = await admin
          .from("bursary_requirements")
          .upsert(rows, { onConflict: "bursary_name,source_url" });
        if (error) throw error;
        totalUpserts += rows.length;
      }
      summary.push({ source: src.name, count: rows.length });
      console.log("extractor: source done", { source: src.name, count: rows.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("extractor: source failed", { source: src.name, message });
      summary.push({ source: src.name, count: 0, error: message });
    } finally {
      try {
        await stagehand?.close();
      } catch (_) {
        // ignore
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, startedAt, totalUpserts, summary }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});