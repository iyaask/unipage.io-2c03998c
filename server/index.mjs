import "dotenv/config";
import express from "express";
import cors from "cors";
import { runApplyAgent } from "./applyAgent.mjs";
import { runDiscoveryAgent } from "./discoverAgent.mjs";
import { matchBursaries } from "./matcher.mjs";
import { supabaseAdmin } from "./supabaseAdmin.mjs";

const app = express();
const port = Number(process.env.API_PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function asyncRoute(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || "Unexpected API error" });
    }
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, human_in_the_loop: process.env.HUMAN_IN_THE_LOOP !== "false" });
});

app.post("/api/agents/discover", asyncRoute(async (_req, res) => {
  const summary = await runDiscoveryAgent();
  res.json(summary);
}));

app.post("/api/agents/apply", asyncRoute(async (req, res) => {
  const { bursary_id, user_id } = req.body || {};
  if (!bursary_id || !user_id) {
    res.status(400).json({ error: "bursary_id and user_id are required" });
    return;
  }

  const application = await runApplyAgent({ bursaryId: bursary_id, userId: user_id });
  res.json({ application });
}));

app.get("/api/matches/:userId", asyncRoute(async (req, res) => {
  const matches = await matchBursaries(req.params.userId);
  res.json({ matches });
}));

app.get("/api/applications/:userId", asyncRoute(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .select("*, bursaries(*)")
    .eq("user_id", req.params.userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  res.json({ applications: data || [] });
}));

app.listen(port, () => {
  console.log(`Agent API listening on http://localhost:${port}`);
});

