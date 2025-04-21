import 'dotenv/config';
import { ChatDeepSeek } from "@langchain/deepseek";
import { LLMResponse } from './types';
import { systemPrompt, extractJsonResponse } from './utils';

export async function createDeepSeekModel(options?: { temperature?: number }) {
  return new ChatDeepSeek({
    model: "deepseek-chat",
    temperature: options?.temperature || 0,
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
}

export async function getStructuredResponse(query: string): Promise<LLMResponse> {
  try {
    const llm = await createDeepSeekModel();
    
    const response = await llm.invoke([
      ["system", systemPrompt],
      ["human", `Responda à pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ter no máximo 1000 caracteres.

Pergunta: ${query}`]
    ]);

    return extractJsonResponse(response.content);
  } catch (error) {
    console.error("Erro ao invocar o modelo DeepSeek:", error);
    return { resposta: "Ocorreu um erro ao processar sua solicitação com DeepSeek." };
  }
}