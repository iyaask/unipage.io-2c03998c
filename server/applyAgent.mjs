import { chromium } from "playwright";
import { CLAUDE_MODEL, extractJson, requireClaude } from "./claude.mjs";
import { supabaseAdmin } from "./supabaseAdmin.mjs";

const HUMAN_IN_THE_LOOP = process.env.HUMAN_IN_THE_LOOP !== "false";

function appendLog(current, line) {
  return [current, `[${new Date().toISOString()}] ${line}`].filter(Boolean).join("\n");
}

async function updateApplication(id, patch) {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function analyseForm(fields, profile, bursary) {
  const anthropic = await requireClaude();
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3000,
    temperature: 0,
    system: "Map a student profile to web form fields. Return only valid JSON.",
    messages: [
      {
        role: "user",
        content: `Return {"fields":[{"selector":"...","value":"...","type":"text|select|checkbox|file"}],"submitSelector":"css selector or null","notes":["..."]}. Do not invent sensitive values that are missing. Form fields: ${JSON.stringify(fields)} Profile: ${JSON.stringify(profile)} Bursary: ${JSON.stringify(bursary)}`,
      },
    ],
  });

  const text = response.content.map((part) => (part.type === "text" ? part.text : "")).join("\n");
  return extractJson(text);
}

async function notifyForApproval({ userId, bursary, applicationId }) {
  if (!process.env.NOTIFICATION_WEBHOOK_URL) {
    return "Approval needed. NOTIFICATION_WEBHOOK_URL is not configured, so no email webhook was sent.";
  }

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
  const response = await fetch(process.env.NOTIFICATION_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "application_approval_required",
      email: userData?.user?.email,
      user_id: userId,
      application_id: applicationId,
      bursary,
    }),
  });

  if (!response.ok) {
    return `Approval needed. Notification webhook failed with ${response.status}.`;
  }

  return "Approval email notification requested through NOTIFICATION_WEBHOOK_URL.";
}

export async function runApplyAgent({ bursaryId, userId }) {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (profileError) throw profileError;

  const { data: bursary, error: bursaryError } = await supabaseAdmin
    .from("bursaries")
    .select("*")
    .eq("id", bursaryId)
    .single();
  if (bursaryError) throw bursaryError;

  const { data: application, error: appError } = await supabaseAdmin
    .from("applications")
    .insert({
      user_id: userId,
      bursary_id: bursaryId,
      status: "pending",
      approval_required: HUMAN_IN_THE_LOOP,
      agent_log: appendLog("", `Application agent started for ${bursary.name}.`),
    })
    .select("*")
    .single();
  if (appError) throw appError;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let agentLog = application.agent_log || "";

  try {
    const targetUrl = bursary.application_url || bursary.url;
    if (!targetUrl) throw new Error("Bursary has no application URL.");

    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    agentLog = appendLog(agentLog, `Opened ${targetUrl}.`);

    const fields = await page.$$eval("input, textarea, select, button[type='submit'], input[type='submit']", (nodes) =>
      nodes.map((node, index) => ({
        index,
        tag: node.tagName.toLowerCase(),
        type: node.getAttribute("type") || "",
        name: node.getAttribute("name") || "",
        id: node.id || "",
        placeholder: node.getAttribute("placeholder") || "",
        ariaLabel: node.getAttribute("aria-label") || "",
        text: node.textContent?.trim() || "",
        selector: node.id ? `#${CSS.escape(node.id)}` : node.getAttribute("name") ? `${node.tagName.toLowerCase()}[name="${CSS.escape(node.getAttribute("name"))}"]` : `${node.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
      }))
    );

    const plan = await analyseForm(fields, profile, bursary);
    agentLog = appendLog(agentLog, `Claude mapped ${plan.fields?.length || 0} fields.`);

    for (const field of plan.fields || []) {
      const locator = page.locator(field.selector).first();
      if ((await locator.count()) === 0) continue;

      if (field.type === "checkbox") {
        const shouldCheck = String(field.value).toLowerCase() !== "false";
        await locator.setChecked(shouldCheck).catch(() => undefined);
      } else if (field.type === "select") {
        await locator.selectOption({ label: String(field.value) }).catch(async () => {
          await locator.selectOption(String(field.value)).catch(() => undefined);
        });
      } else if (field.type !== "file") {
        await locator.fill(String(field.value ?? "")).catch(() => undefined);
      }
    }

    const screenshotPath = `${userId}/${application.id}.png`;
    const screenshot = await page.screenshot({ fullPage: true });
    const { error: uploadError } = await supabaseAdmin.storage
      .from("application-screenshots")
      .upload(screenshotPath, screenshot, { contentType: "image/png", upsert: true });
    if (uploadError) throw uploadError;

    agentLog = appendLog(agentLog, "Form fields filled and screenshot saved.");

    if (HUMAN_IN_THE_LOOP) {
      const notification = await notifyForApproval({ userId, bursary, applicationId: application.id });
      agentLog = appendLog(agentLog, notification);
      return updateApplication(application.id, {
        status: "reviewing",
        screenshot_url: screenshotPath,
        proof: { plan, human_in_the_loop: true },
        agent_log: agentLog,
      });
    }

    if (plan.submitSelector) {
      await page.locator(plan.submitSelector).first().click({ timeout: 10000 });
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
      agentLog = appendLog(agentLog, "Application submitted.");
      return updateApplication(application.id, {
        status: "submitted",
        submitted_at: new Date().toISOString(),
        screenshot_url: screenshotPath,
        proof: { plan, human_in_the_loop: false },
        agent_log: agentLog,
      });
    }

    agentLog = appendLog(agentLog, "No submit selector was found.");
    return updateApplication(application.id, {
      status: "reviewing",
      screenshot_url: screenshotPath,
      proof: { plan, human_in_the_loop: false },
      agent_log: agentLog,
    });
  } catch (error) {
    agentLog = appendLog(agentLog, `Failed: ${error.message}`);
    await updateApplication(application.id, { status: "failed", agent_log: agentLog });
    throw error;
  } finally {
    await browser.close();
  }
}

