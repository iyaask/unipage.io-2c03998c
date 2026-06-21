import { chromium } from "playwright";
import { CLAUDE_MODEL, extractJson, requireClaude } from "./claude.mjs";
import { supabaseAdmin } from "./supabaseAdmin.mjs";

const SOURCES = [
  "https://zabursaries.co.za/",
  "https://www.nsfas.org.za/content/",
  "https://zabursaries.com/",
];

async function scrapeSource(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);

  const links = await page.$$eval("a", (anchors) =>
    anchors
      .map((anchor) => ({
        text: anchor.textContent?.replace(/\s+/g, " ").trim() || "",
        href: anchor.href,
      }))
      .filter((link) => /bursar|fund|apply|nsfas|scholar/i.test(`${link.text} ${link.href}`))
      .slice(0, 40)
  );

  const bodyText = await page.locator("body").innerText({ timeout: 10000 });
  return {
    source: url,
    text: bodyText.replace(/\s+/g, " ").slice(0, 12000),
    links,
  };
}

async function structureWithClaude(scrapedPages) {
  const anthropic = await requireClaude();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 6000,
    temperature: 0,
    system: "Extract South African bursary opportunities from scraped webpages. Return only valid JSON.",
    messages: [
      {
        role: "user",
        content: `Return a JSON array of bursaries. Each item must have: name, provider, url, deadline, amount, eligibility (object), fields_of_study (array of strings), application_url, status ("open","closed","unknown"). Use null for unknown scalar values. Scraped pages:\n${JSON.stringify(scrapedPages)}`,
      },
    ],
  });

  const text = response.content.map((part) => (part.type === "text" ? part.text : "")).join("\n");
  const parsed = extractJson(text);
  return Array.isArray(parsed) ? parsed : parsed.bursaries || [];
}

export async function runDiscoveryAgent() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const scraped = [];

  try {
    for (const source of SOURCES) {
      scraped.push(await scrapeSource(page, source));
    }
  } finally {
    await browser.close();
  }

  const bursaries = (await structureWithClaude(scraped))
    .filter((item) => item?.name)
    .map((item) => ({
      name: String(item.name).slice(0, 240),
      provider: item.provider ? String(item.provider).slice(0, 240) : "Unknown",
      url: item.url || item.application_url || null,
      deadline: item.deadline || null,
      amount: item.amount || null,
      eligibility: item.eligibility || {},
      fields_of_study: Array.isArray(item.fields_of_study) ? item.fields_of_study.map(String) : [],
      application_url: item.application_url || item.url || null,
      status: ["open", "closed", "unknown"].includes(item.status) ? item.status : "unknown",
      last_scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

  const results = [];
  for (const bursary of bursaries) {
    const { data, error } = await supabaseAdmin
      .from("bursaries")
      .upsert(bursary, { onConflict: "name,provider" })
      .select("id,name,provider,status")
      .single();

    results.push(error ? { name: bursary.name, error: error.message } : data);
  }

  return {
    sources: SOURCES,
    found: bursaries.length,
    stored: results.filter((item) => !item.error).length,
    results,
  };
}

