import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { createChatCompletion } from "./groqClient";
import { CHAT_SYSTEM_PROMPT } from "./prompts";
import { toolDefinitions, toolHandlers, ToolContext } from "./tools";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY_MESSAGES = 10;
const MAX_ITERATIONS = 5;

// Loop de tool-calling: manda a mensagem, executa qualquer tool_calls que a
// Groq peça, devolve o resultado e repete até a resposta vir sem tool_calls
// (ou até MAX_ITERATIONS, pra nunca rodar infinito). As mensagens intermediárias
// de tool_use/tool_result vivem só dentro desta função — o Frontend só vê a
// pergunta do usuário e a resposta final em texto.
export async function runChat(history: ChatTurn[], ctx: ToolContext): Promise<ChatTurn> {
  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...trimmedHistory.map((m): ChatCompletionMessageParam => ({ role: m.role, content: m.content })),
  ];

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const response = await createChatCompletion({ messages, tools: toolDefinitions, tool_choice: "auto" });
    const message = response.choices[0].message;

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return { role: "assistant", content: message.content ?? "" };
    }

    messages.push({ role: "assistant", content: message.content, tool_calls: message.tool_calls });

    for (const call of message.tool_calls) {
      const handler = toolHandlers[call.function.name];
      const args = safeParseArgs(call.function.arguments);
      const result = handler ? await handler(args, ctx) : { error: "Ferramenta desconhecida" };
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }

  return {
    role: "assistant",
    content: "Não consegui concluir sua solicitação agora. Pode reformular ou tentar de novo em instantes?",
  };
}

function safeParseArgs(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
