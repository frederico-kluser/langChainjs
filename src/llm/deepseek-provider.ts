import 'dotenv/config';
import { ChatDeepSeek } from "@langchain/deepseek";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { systemPrompt, extractJsonResponse } from '../utils';

class DeepSeekProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    return new ChatDeepSeek({
      model: "deepseek-chat",
      temperature: config?.temperature || 0,
      apiKey: process.env.DEEPSEEK_API_KEY,
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
      console.error("Erro ao invocar o modelo DeepSeek:", error);
      return { resposta: "Ocorreu um erro ao processar sua solicitação com DeepSeek." };
    }
  }
}

export default DeepSeekProvider;