import type { Config } from "@netlify/functions";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { jsonError, mapClaudeError, runClaude, textFromMessage } from "./_shared/claude.ts";
import { extractJson, parseAnalysis, todayKst } from "./_shared/parse.ts";
import { parseUserProfile, profileToText } from "./_shared/profile.ts";
import { ANALYZE_SYSTEM, buildAnalyzeUserMessage } from "./_shared/prompts.ts";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export default async (req: Request) => {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonError("요청 본문을 읽지 못했습니다.", 400);
  }

  const profile = parseUserProfile(payload);
  if (typeof profile === "string") {
    return jsonError(profile, 400);
  }

  const today = todayKst();
  const urls = profile.portfolio?.urls ?? [];
  const files = profile.portfolio?.files ?? [];

  const blocks: Extract<MessageParam["content"], unknown[]> = [
    {
      type: "text",
      text: buildAnalyzeUserMessage({
        today,
        profileText: profileToText(profile),
        portfolioUrls: urls,
      }),
    },
  ];

  for (const file of files) {
    if (file.mediaType === "application/pdf") {
      blocks.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: file.data,
        },
      });
      continue;
    }
    if (IMAGE_TYPES.has(file.mediaType)) {
      blocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: file.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: file.data,
        },
      });
    }
  }

  try {
    const message = await runClaude({
      system: ANALYZE_SYSTEM,
      maxTokens: 4096,
      messages: [{ role: "user", content: blocks }],
      tools:
        urls.length > 0
          ? [{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 5 }]
          : undefined,
    });

    const text = textFromMessage(message);
    if (!text) {
      return jsonError("분석 결과를 받지 못했습니다.", 502);
    }

    const analysis = parseAnalysis(extractJson(text));
    return Response.json({ analysis });
  } catch (error) {
    const mapped = mapClaudeError(error);
    return jsonError(mapped.message, mapped.status);
  }
};

export const config: Config = {
  path: "/api/analyze",
  method: "POST",
};
