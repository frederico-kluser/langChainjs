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
        ["human", `Responda à pergunta abaixo.
${config?.outputSchema ? 'A resposta deve ser estruturada conforme solicitado.' : 'Responda de forma clara e concisa.'}

Pergunta: ${query}`]
      ]);

      const content = response.content.toString();
      
      // Para resposta não estruturada (texto simples)
      if (!config?.outputSchema) {
        // Retornar texto diretamente sem tentar extrair JSON
        return content as T;
      }
      
      // Para resposta estruturada com schema
      return extractJsonResponse<T>(content, config?.outputSchema);
    } catch (error) {
      console.error("Erro ao invocar o modelo Claude:", error);
      return "Ocorreu um erro ao processar sua solicitação com Claude." as T;
    }
  }
}

export default ClaudeProvider;