import 'dotenv/config';
import { ChatAnthropic } from "@langchain/anthropic";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { getSystemPrompt, extractJsonResponse } from '../utils';

class ClaudeProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    return new ChatAnthropic({
      model: "claude-3-sonnet-20240229",
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0.1,
    });
  }

  async getResponse<T = string>(query: string, config?: ModelConfig): Promise<LLMResponse<T>> {
    try {
      const model = await this.createModel(config);
      
      // Usa o prompt personalizado ou o padrão
      const customPrompt = getSystemPrompt(config?.outputSchema);
      
      const response = await model.invoke([
        ["system", customPrompt],
        ["human", `Responda à pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ser estruturada conforme solicitado.

Pergunta: ${query}`]
      ]);

      // Extrai a resposta JSON com base no schema solicitado
      return extractJsonResponse<T>(response.content.toString(), config?.outputSchema);
    } catch (error) {
      console.error("Erro ao invocar o modelo Claude:", error);
      return { resposta: "Ocorreu um erro ao processar sua solicitação com Claude." as T };
    }
  }
}

export default ClaudeProvider;