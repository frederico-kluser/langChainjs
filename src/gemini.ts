import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLMResponse } from './types';
import { systemPrompt, extractJsonResponse } from './utils';

export async function createGeminiModel(options?: { temperature?: number }) {
  return new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: options?.temperature || 0,
    apiKey: process.env.GEMINI_API_KEY,
  });
}

export async function getStructuredResponse(query: string): Promise<LLMResponse> {
  try {
    const llm = await createGeminiModel();
    
    const response = await llm.invoke([
      ["system", systemPrompt],
      ["human", `Responda à pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ter no máximo 1000 caracteres.

Pergunta: ${query}`]
    ]);

    return extractJsonResponse(response.content);
  } catch (error) {
    console.error("Erro ao invocar o modelo Gemini:", error);
    return "Ocorreu um erro ao processar sua solicitação com Gemini.";
  }
}