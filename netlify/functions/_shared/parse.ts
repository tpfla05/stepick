import type {
  Activity,
  ActivityCategory,
  AnalysisResult,
  CompetencyItem,
  RecommendResult,
} from "../../../src/types.ts";

const CATEGORIES = new Set<ActivityCategory>([
  "대외활동",
  "공모전",
  "교육/부트캠프",
  "인턴",
  "프로젝트/해커톤",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("모델 응답에서 JSON을 찾지 못했습니다.");
  }
  try {
    return JSON.parse(raw.slice(start, end + 1)) as unknown;
  } catch {
    throw new Error("모델 응답 JSON을 파싱하지 못했습니다.");
  }
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter((item): item is string => item !== null);
}

function asIsoDate(value: unknown): string | null {
  const text = asString(value);
  if (!text || !ISO_DATE.test(text)) return null;
  const time = Date.parse(`${text}T00:00:00+09:00`);
  if (Number.isNaN(time)) return null;
  return text;
}

function asPriority(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(1, Math.round(value));
}

function parseCompetency(value: unknown, withPriority: boolean): CompetencyItem | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const name = asString(record.name);
  const reason = asString(record.reason);
  if (!name || !reason) return null;
  const item: CompetencyItem = {
    name,
    evidence: asString(record.evidence),
    reason,
  };
  if (withPriority) {
    item.priority = asPriority(record.priority) ?? 99;
  }
  return item;
}

export function parseAnalysis(raw: unknown): AnalysisResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("분석 결과 형식이 올바르지 않습니다.");
  }
  const record = raw as Record<string, unknown>;
  const summary = asString(record.summary);
  if (!summary) {
    throw new Error("분석 요약이 없습니다.");
  }

  const strengths = Array.isArray(record.strengths)
    ? record.strengths
        .map((item) => parseCompetency(item, false))
        .filter((item): item is CompetencyItem => item !== null)
    : [];
  const gaps = Array.isArray(record.gaps)
    ? record.gaps
        .map((item) => parseCompetency(item, true))
        .filter((item): item is CompetencyItem => item !== null)
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
    : [];
  const unknowns = Array.isArray(record.unknowns)
    ? record.unknowns
        .map((item) => parseCompetency(item, false))
        .filter((item): item is CompetencyItem => item !== null)
    : [];

  return {
    summary,
    requiredCompetencies: asStringArray(record.requiredCompetencies),
    strengths,
    gaps,
    unknowns,
  };
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function parseActivity(value: unknown, today: string, checkedAt: string): Activity | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const title = asString(record.title);
  const url = asString(record.url);
  const reason = asString(record.recommendationReason);
  const category = asString(record.category);
  if (!title || !url || !reason) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  if (!category || !CATEGORIES.has(category as ActivityCategory)) return null;

  const endDate = asIsoDate(record.endDate);
  if (!endDate) return null;
  if (endDate < today) return null;

  const scoreRaw = record.recommendationScore;
  const score =
    typeof scoreRaw === "number" && Number.isFinite(scoreRaw)
      ? Math.min(100, Math.max(0, Math.round(scoreRaw)))
      : null;
  if (score === null) return null;

  return {
    title,
    organization: asString(record.organization),
    category: category as ActivityCategory,
    startDate: asIsoDate(record.startDate),
    endDate,
    target: asString(record.target),
    url,
    source: asString(record.source) ?? hostFromUrl(url),
    relatedSkills: asStringArray(record.relatedSkills),
    recommendationScore: score,
    recommendationReason: reason,
    checkedAt,
  };
}

export function parseRecommend(raw: unknown, today: string): RecommendResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("추천 결과 형식이 올바르지 않습니다.");
  }
  const record = raw as Record<string, unknown>;
  const list = Array.isArray(record.activities) ? record.activities : [];
  const activities = list
    .map((item) => parseActivity(item, today, today))
    .filter((item): item is Activity => item !== null)
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  return { activities };
}
