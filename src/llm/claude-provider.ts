import 'dotenv/config';
import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { systemPrompt, extractJsonResponse } from '../utils';

class ClaudeProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    const model = new ChatAnthropic({
      model: "claude-3-sonnet-20240229",
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0.1,
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

  async getResponse(query: string, config?: ModelConfig): Promise<LLMResponse> {
    try {
      const agent = await this.createModel(config);
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
      return { resposta: "Ocorreu um erro ao processar sua solicitação com Claude." };
    }
  }
}

export default ClaudeProvider;