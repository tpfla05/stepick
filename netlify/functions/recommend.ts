import type { Config } from "@netlify/functions";
import type { Activity } from "../../src/types.ts";
import {
  listOpenLinkareerActivities,
  recommendFromLinkareer,
} from "../../src/lib/linkareerActivities.ts";
import { jsonError, mapClaudeError, runClaude, textFromMessage } from "./_shared/claude.ts";
import { extractJson, parseAnalysis, parseRecommend, todayKst } from "./_shared/parse.ts";
import { parseUserProfile, profileToText } from "./_shared/profile.ts";
import { RECOMMEND_SYSTEM, buildRecommendUserMessage } from "./_shared/prompts.ts";

export default async (req: Request) => {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonError("요청 본문을 읽지 못했습니다.", 400);
  }

  if (!payload || typeof payload !== "object") {
    return jsonError("요청 형식이 올바르지 않습니다.", 400);
  }

  const body = payload as { profile?: unknown; analysis?: unknown };
  const profile = parseUserProfile(body.profile ?? payload, { requireDetails: false });
  if (typeof profile === "string") {
    return jsonError(profile, 400);
  }

  let analysis;
  try {
    analysis = parseAnalysis(body.analysis);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "분석 결과가 없습니다.", 400);
  }

  const today = todayKst();
  const catalog = listOpenLinkareerActivities(today);
  const fallback = recommendFromLinkareer(profile, analysis);
  const focusedAnalysis = { ...analysis, gaps: analysis.gaps.slice(0, 3) };

  try {
    const message = await runClaude({
      system: RECOMMEND_SYSTEM,
      maxTokens: 2500,
      messages: [
        {
          role: "user",
          content: buildRecommendUserMessage({
            today,
            profileText: profileToText({
              ...profile,
              portfolio: profile.portfolio
                ? { urls: profile.portfolio.urls, text: profile.portfolio.text }
                : undefined,
            }),
            analysisJson: JSON.stringify(focusedAnalysis),
            catalogJson: JSON.stringify(catalog),
          }),
        },
      ],
    });

    const text = textFromMessage(message);
    const parsed = text ? parseRecommend(extractJson(text), today) : { activities: [] };
    const activities = attachCatalogFields(today, parsed.activities, catalog);
    return Response.json({ activities: activities.length > 0 ? activities : fallback });
  } catch (error) {
    if (fallback.length > 0) {
      return Response.json({ activities: fallback });
    }
    const mapped = mapClaudeError(error);
    return jsonError(mapped.message, mapped.status);
  }
};

function activityId(url: string): string | null {
  return url.match(/\/activity\/(\d+)/)?.[1] ?? null;
}

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/$/, "").split("?")[0];
}

function compactTitle(title: string): string {
  return title.replace(/\s+/g, "");
}

function findCatalogItem(
  activity: Activity,
  catalog: ReturnType<typeof listOpenLinkareerActivities>,
) {
  if (activity.url) {
    const normalized = normalizeUrl(activity.url);
    const byUrl = catalog.find(
      (entry) => entry.url === activity.url || normalizeUrl(entry.url) === normalized,
    );
    if (byUrl) return byUrl;
    const id = activityId(activity.url);
    if (id) {
      const byId = catalog.find((entry) => activityId(entry.url) === id);
      if (byId) return byId;
    }
  }

  if (activity.title) {
    const compact = compactTitle(activity.title);
    const exact = catalog.find((entry) => entry.title === activity.title);
    if (exact) return exact;
    return catalog.find((entry) => {
      const entryTitle = compactTitle(entry.title);
      return entryTitle.includes(compact) || compact.includes(entryTitle.slice(0, 16));
    });
  }

  return undefined;
}

function attachCatalogFields(
  today: string,
  parsed: Activity[],
  catalog: ReturnType<typeof listOpenLinkareerActivities>,
): Activity[] {
  const seen = new Set<string>();
  const hydrated: Activity[] = [];

  for (const activity of parsed) {
    const item = findCatalogItem(activity, catalog);
    if (!item || seen.has(item.url)) continue;
    seen.add(item.url);
    hydrated.push({
      title: item.title,
      organization: item.organization,
      category: item.category,
      startDate: item.startDate,
      endDate: item.endDate,
      target: item.target,
      url: item.url,
      source: "링커리어",
      relatedSkills: activity.relatedSkills,
      recommendationScore: activity.recommendationScore,
      recommendationReason: activity.recommendationReason,
      checkedAt: today,
    });
    if (hydrated.length >= 3) break;
  }

  return hydrated;
}

export const config: Config = {
  path: "/api/recommend",
  method: "POST",
};
