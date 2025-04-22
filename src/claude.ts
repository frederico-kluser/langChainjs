import 'dotenv/config';
import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { LLMResponse } from './types';
import { systemPrompt, extractJsonResponse } from './utils';

export async function createClaudeModel(options?: { maxTokens?: number; temperature?: number }) {
  const model = new ChatAnthropic({
    model: "claude-3-sonnet-20240229",
    maxTokens: options?.maxTokens || 1000,
    temperature: options?.temperature || 0.1,
  });

  const structuredResponse = tool(
    async ({ query }) => {
      return `Resposta estruturada para: "${query}"`;
    },
    {
      name: "estruturar_resposta",
      description: "Estrutura a resposta em formato JSON com informações sobre o tema solicitado",
      schema: z.object({
        query: z.string().describe("A pergunta ou tema que precisa de uma resposta estruturada"),
      }),
    }
  );

  const agent = createReactAgent({
    llm: model,
    tools: [structuredResponse],
    agentState: {
      createSystemPrompt: () => systemPrompt,
    },
  } as any);

  return agent;
}

export async function getStructuredResponse(query: string): Promise<LLMResponse> {
  try {
    const agent = await createClaudeModel();
    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    });
    
    const lastMessage = result.messages[result.messages.length - 1];
    return extractJsonResponse(lastMessage.content.toString());
  } catch (error) {
    console.error("Erro ao invocar o agente Claude:", error);
    return "Ocorreu um erro ao processar sua solicitação com Claude.";
  }
}