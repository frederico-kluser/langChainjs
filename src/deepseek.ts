import 'dotenv/config';
import { ChatDeepSeek } from "@langchain/deepseek";
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMResponse } from './types';
import { systemPrompt, formatInstructions, extractJsonResponse } from './utils';

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
    
    const promptTemplate = PromptTemplate.fromTemplate(
      `${formatInstructions}
      
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
    console.error("Erro ao invocar o modelo DeepSeek:", error);
    return { resposta: "Ocorreu um erro ao processar sua solicitação com DeepSeek." };
  }
}