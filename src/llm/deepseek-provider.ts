import 'dotenv/config';
import { ChatDeepSeek } from "@langchain/deepseek";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { getSystemPrompt, extractJsonResponse } from '../utils';

class DeepSeekProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    return new ChatDeepSeek({
      model: "deepseek-chat",
      temperature: config?.temperature || 0,
      apiKey: process.env.DEEPSEEK_API_KEY,
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
      console.error("Erro ao invocar o modelo DeepSeek:", error);
      return { resposta: "Ocorreu um erro ao processar sua solicitação com DeepSeek." as T };
    }
  }
}

export default DeepSeekProvider;