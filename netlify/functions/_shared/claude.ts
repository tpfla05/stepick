import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

export const MODEL = "claude-haiku-4-5-20251001";

export function getClient(): Anthropic {
  const fromNetlify =
    typeof Netlify === "undefined" ? undefined : Netlify.env.get("ANTHROPIC_API_KEY");
  const apiKey = fromNetlify || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY가 없습니다. 로컬은 .env, 배포는 Netlify 환경변수에 넣어 주세요.",
    );
  }
  return new Anthropic({ apiKey });
}

export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export function mapClaudeError(error: unknown): { message: string; status: number } {
  if (error instanceof Anthropic.APIError) {
    if (error.status === 401) {
      return { message: "Claude API 키가 유효하지 않습니다.", status: 502 };
    }
    if (error.status === 429) {
      return { message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.", status: 429 };
    }
    return { message: "Claude 응답을 받지 못했습니다.", status: 502 };
  }
  if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
    return { message: error.message, status: 500 };
  }
  if (error instanceof Error) {
    return { message: error.message, status: 502 };
  }
  return { message: "처리 중 오류가 발생했습니다.", status: 500 };
}

export function textFromMessage(message: Anthropic.Message): string {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export async function runClaude(options: {
  system: string;
  messages: MessageParam[];
  maxTokens: number;
  tools?: Anthropic.Messages.ToolUnion[];
}): Promise<Anthropic.Message> {
  const client = getClient();
  const messages: MessageParam[] = [...options.messages];
  const tools = options.tools && options.tools.length > 0 ? { tools: options.tools } : {};

  let message = await client.messages.create({
    model: MODEL,
    max_tokens: options.maxTokens,
    system: options.system,
    messages,
    ...tools,
  });

  let extraTurns = 0;
  while (message.stop_reason === "pause_turn" && extraTurns < 3) {
    extraTurns += 1;
    messages.push({ role: "assistant", content: message.content });
    message = await client.messages.create({
      model: MODEL,
      max_tokens: options.maxTokens,
      system: options.system,
      messages,
      ...tools,
    });
  }

  return message;
}
