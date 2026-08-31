import type { Config } from "@netlify/functions";
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

  try {
    const message = await runClaude({
      system: RECOMMEND_SYSTEM,
      maxTokens: 8192,
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
            analysisJson: JSON.stringify(analysis),
          }),
        },
      ],
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: 6 },
        { type: "web_fetch_20260209", name: "web_fetch", max_uses: 8 },
      ],
    });

    const text = textFromMessage(message);
    if (!text) {
      return jsonError("추천 결과를 받지 못했습니다.", 502);
    }

    const result = parseRecommend(extractJson(text), today);
    return Response.json(result);
  } catch (error) {
    const mapped = mapClaudeError(error);
    return jsonError(mapped.message, mapped.status);
  }
};

export const config: Config = {
  path: "/api/recommend",
  method: "POST",
};
