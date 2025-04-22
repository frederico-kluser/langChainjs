import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { promptTemplate, parser, extractJsonResponse } from '../utils';

class OllamaProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    return new ChatOllama({
      model: 'rolandroland/llama3.1-uncensored:latest',
      temperature: config?.temperature || 0,
    });
  }

  async getResponse<T = string>(query: string, config?: ModelConfig): Promise<LLMResponse<T>> {
    try {
      const llm = await this.createModel(config);
      
      // Para o Ollama, usamos o promptTemplate que funciona melhor com este modelo
      const prompt = await promptTemplate.format({
        question: query,
        formatInstructions: parser.getFormatInstructions(),
      });

      const response = await llm.invoke(prompt);
      const content = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
      
      if (config?.outputSchema) {
        return extractJsonResponse<T>(content, config.outputSchema);
      } else {
        const parsed = await parser.parse(content);
        return parsed as LLMResponse<T>;
      }
    } catch (error) {
      console.error('Erro ao processar a resposta com Ollama:', error);
      return { resposta: 'Ocorreu um erro ao processar a resposta com Ollama.' as T };
    }
  }
}

export default OllamaProvider;