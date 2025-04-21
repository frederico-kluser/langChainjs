import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMResponse } from './types';
import { systemPrompt, formatInstructions, extractJsonResponse } from './utils';

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
    
    const promptTemplate = PromptTemplate.fromTemplate(
      `${systemPrompt}
      
      ${formatInstructions}
      
      Pergunta: {question}`
    );

    const prompt = await promptTemplate.format({
      question: query,
    });

    const response = await llm.invoke([
      ["system", systemPrompt],
      ["human", prompt]
    ]);

    return extractJsonResponse(response.content);
  } catch (error) {
    console.error("Erro ao invocar o modelo Gemini:", error);
    return { resposta: "Ocorreu um erro ao processar sua solicitação com Gemini." };
  }
}