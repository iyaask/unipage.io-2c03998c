import { supabaseAdmin } from "./supabaseAdmin.mjs";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function includesAny(haystack, needles) {
  const text = normalize(Array.isArray(haystack) ? haystack.join(" ") : haystack);
  return needles.some((needle) => needle && text.includes(normalize(needle)));
}

function parseIncome(value) {
  const numbers = String(value || "").match(/\d[\d\s,]*/g);
  if (!numbers?.length) return null;
  return Math.max(...numbers.map((item) => Number(item.replace(/[^\d]/g, ""))).filter(Boolean));
}

function scoreBursary(profile, bursary) {
  const reasons = [];
  let score = 35;
  const eligibility = bursary.eligibility && typeof bursary.eligibility === "object" ? bursary.eligibility : {};
  const eligibilityText = JSON.stringify(eligibility).toLowerCase();
  const fields = bursary.fields_of_study || [];
  const profileFields = [profile.degree, profile.faculty].filter(Boolean);

  if (profileFields.length && includesAny(fields, profileFields)) {
    score += 25;
    reasons.push("field of study matches");
  } else if (profileFields.length && includesAny(eligibilityText, profileFields)) {
    score += 15;
    reasons.push("eligibility mentions your study area");
  }

  if (profile.race && eligibilityText.includes(normalize(profile.race))) {
    score += 10;
    reasons.push(`supports ${profile.race} applicants`);
  }

  if (profile.university && eligibilityText.includes(normalize(profile.university))) {
    score += 10;
    reasons.push("mentions your university");
  }

  if (profile.province && eligibilityText.includes(normalize(profile.province))) {
    score += 5;
    reasons.push("province aligns");
  }

  if (profile.disability && /disab/.test(eligibilityText)) {
    score += 8;
    reasons.push("disability support appears relevant");
  }

  const profileIncome = parseIncome(profile.household_income);
  const incomeNumbers = eligibilityText.match(/\d[\d\s,]*/g)?.map((item) => Number(item.replace(/[^\d]/g, ""))).filter(Boolean) || [];
  if (profileIncome && incomeNumbers.length && profileIncome <= Math.max(...incomeNumbers)) {
    score += 12;
    reasons.push("household income appears within threshold");
  }

  if (bursary.status === "open") {
    score += 5;
    reasons.push("currently marked open");
  }

  return {
    ...bursary,
    match_score: Math.min(100, Math.max(0, score)),
    reason: reasons.length ? reasons.join(", ") : "general eligibility may fit your profile",
  };
}

export async function matchBursaries(userId) {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return [];

  const { data: bursaries, error: bursaryError } = await supabaseAdmin
    .from("bursaries")
    .select("*")
    .in("status", ["open", "unknown"])
    .order("last_scraped_at", { ascending: false })
    .limit(100);

  if (bursaryError) throw bursaryError;

  return (bursaries || [])
    .map((bursary) => scoreBursary(profile, bursary))
    .filter((match) => match.match_score >= 40)
    .sort((a, b) => b.match_score - a.match_score);
}

