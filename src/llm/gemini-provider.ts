import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { getSystemPrompt, extractJsonResponse } from '../utils';

class GeminiProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    return new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: config?.temperature || 0,
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async getResponse<T = string>(query: string, config?: ModelConfig): Promise<LLMResponse<T>> {
    try {
      const llm = await this.createModel(config);
      
      // Usa o prompt personalizado ou o padrão
      const customPrompt = getSystemPrompt(config?.outputSchema);
      
      const response = await llm.invoke([
        ["system", customPrompt],
        ["human", `Responda à pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ser estruturada conforme solicitado.

Pergunta: ${query}`]
      ]);

      return extractJsonResponse<T>(response.content.toString(), config?.outputSchema);
    } catch (error) {
      console.error("Erro ao invocar o modelo Gemini:", error);
      return { resposta: "Ocorreu um erro ao processar sua solicitação com Gemini." as T };
    }
  }
}

export default GeminiProvider;