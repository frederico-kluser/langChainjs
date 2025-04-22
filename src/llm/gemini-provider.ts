import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { systemPrompt, extractJsonResponse } from '../utils';

class GeminiProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    return new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: config?.temperature || 0,
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async getResponse(query: string, config?: ModelConfig): Promise<LLMResponse> {
    try {
      const llm = await this.createModel(config);
      
      const response = await llm.invoke([
        ["system", systemPrompt],
        ["human", `Responda à pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ter no máximo 1000 caracteres.

Pergunta: ${query}`]
      ]);

      return extractJsonResponse(response.content);
    } catch (error) {
      console.error("Erro ao invocar o modelo Gemini:", error);
      return { resposta: "Ocorreu um erro ao processar sua solicitação com Gemini." };
    }
  }
}

export default GeminiProvider;