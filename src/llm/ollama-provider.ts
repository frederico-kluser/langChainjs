import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { promptTemplate, parser } from '../utils';

class OllamaProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    return new ChatOllama({
      model: 'rolandroland/llama3.1-uncensored:latest',
      temperature: config?.temperature || 0,
    });
  }

  async getResponse(query: string, config?: ModelConfig): Promise<LLMResponse> {
    try {
      const llm = await this.createModel(config);
      
      const prompt = await promptTemplate.format({
        question: query,
        formatInstructions: parser.getFormatInstructions(),
      });

      const response = await llm.invoke(prompt);
      const content = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
      
      return await parser.parse(content);
    } catch (error) {
      console.error('Erro ao processar a resposta com Ollama:', error);
      return { resposta: 'Ocorreu um erro ao processar a resposta com Ollama.' };
    }
  }
}

export default OllamaProvider;