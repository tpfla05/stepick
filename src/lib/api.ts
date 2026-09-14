import type { AnalysisResult, RecommendResult, UserProfile } from "../types.ts";

function slimProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    portfolio: profile.portfolio
      ? {
          urls: profile.portfolio.urls,
          text: profile.portfolio.text,
        }
      : undefined,
  };
}

async function readError(response: Response, fallback: string): Promise<string> {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error ?? fallback;
}

export async function analyzeProfile(profile: UserProfile): Promise<AnalysisResult> {
  return analyzeProfileLive(profile);
}

export async function recommendActivities(
  profile: UserProfile,
  analysis: AnalysisResult,
): Promise<RecommendResult> {
  return recommendActivitiesLive(profile, analysis);
}

export async function analyzeProfileLive(profile: UserProfile): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, "분석을 시작하지 못했습니다."));
  }
  const data = (await response.json()) as { analysis?: AnalysisResult };
  if (!data.analysis) {
    throw new Error("분석 결과가 비어 있습니다.");
  }
  return data.analysis;
}

export async function recommendActivitiesLive(
  profile: UserProfile,
  analysis: AnalysisResult,
): Promise<RecommendResult> {
  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: slimProfile(profile), analysis }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, "활동 추천을 시작하지 못했습니다."));
  }
  const data = (await response.json()) as RecommendResult;
  if (!data || !Array.isArray(data.activities)) {
    throw new Error("추천 결과가 비어 있습니다.");
  }
  return data;
}
