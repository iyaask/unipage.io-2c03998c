import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Bursary = Database["public"]["Tables"]["bursaries"]["Row"];
export type StudentProfile = Database["public"]["Tables"]["student_profiles"]["Row"];

export type BursaryMatch = {
  bursary: Bursary;
  score: number; // 0-100
  reasons: string[];
};

const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();

const incomeBracket = (raw: string | null | undefined): number => {
  // Extract the first number from strings like "R0 - R100 000" / "R350000"
  const digits = String(raw ?? "").replace(/[^\d]/g, "");
  if (!digits) return Number.POSITIVE_INFINITY;
  return Number(digits.slice(0, 9));
};

/**
 * Score a bursary against the student profile.
 * Eligibility JSON can include any subset of:
 *   { races: string[], genders: string[], universities: string[],
 *     provinces: string[], min_gpa: number, max_household_income: number,
 *     disability_required: boolean, fields_of_study: string[] }
 */
const scoreBursary = (bursary: Bursary, profile: StudentProfile): BursaryMatch => {
  const reasons: string[] = [];
  let score = 40; // baseline for an open bursary

  const elig = (bursary.eligibility ?? {}) as Record<string, unknown>;

  const races = (elig.races as string[] | undefined)?.map(norm) ?? [];
  if (races.length && profile.race && races.includes(norm(profile.race))) {
    score += 12;
    reasons.push(`Open to ${profile.race} applicants`);
  }

  const genders = (elig.genders as string[] | undefined)?.map(norm) ?? [];
  if (genders.length && profile.gender && genders.includes(norm(profile.gender))) {
    score += 8;
    reasons.push(`Targets ${profile.gender} students`);
  }

  const universities = (elig.universities as string[] | undefined)?.map(norm) ?? [];
  if (universities.length && profile.university && universities.includes(norm(profile.university))) {
    score += 10;
    reasons.push(`Accepts ${profile.university}`);
  }

  const provinces = (elig.provinces as string[] | undefined)?.map(norm) ?? [];
  if (provinces.length && profile.province && provinces.includes(norm(profile.province))) {
    score += 6;
    reasons.push(`Province match (${profile.province})`);
  }

  const fields = (bursary.fields_of_study ?? []).map(norm);
  const studentFields = [profile.faculty, profile.degree].filter(Boolean).map(norm);
  if (fields.length && studentFields.some((f) => fields.some((bf) => bf.includes(f) || f.includes(bf)))) {
    score += 14;
    reasons.push(`Field of study match`);
  }

  const minGpa = Number(elig.min_gpa);
  if (!Number.isNaN(minGpa) && profile.gpa != null) {
    if (Number(profile.gpa) >= minGpa) {
      score += 6;
      reasons.push(`GPA ≥ ${minGpa}`);
    } else {
      score -= 20;
      reasons.push(`GPA below ${minGpa}`);
    }
  }

  const maxIncome = Number(elig.max_household_income);
  if (!Number.isNaN(maxIncome)) {
    const hh = incomeBracket(profile.household_income);
    if (hh <= maxIncome) {
      score += 8;
      reasons.push(`Household income within bracket`);
    } else {
      score -= 15;
      reasons.push(`Household income exceeds bracket`);
    }
  }

  if (elig.disability_required === true) {
    if (profile.disability) {
      score += 6;
      reasons.push(`Disability-specific bursary`);
    } else {
      score -= 30;
    }
  }

  if (bursary.status === "closed") score -= 50;

  score = Math.max(0, Math.min(100, score));
  return { bursary, score, reasons };
};

export async function matchBursaries(userId: string): Promise<BursaryMatch[]> {
  const [{ data: profile, error: pErr }, { data: bursaries, error: bErr }] = await Promise.all([
    supabase.from("student_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("bursaries").select("*").in("status", ["open", "unknown"]),
  ]);

  if (pErr) throw pErr;
  if (bErr) throw bErr;
  if (!profile) return [];
  if (!bursaries) return [];

  return bursaries
    .map((b) => scoreBursary(b, profile))
    .sort((a, b) => b.score - a.score);
}
