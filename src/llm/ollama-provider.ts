import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { ModelConfig } from '../types';
import { BaseLLMProvider } from './base-provider';

class OllamaProvider extends BaseLLMProvider {
  protected readonly providerName = 'Ollama';

  async createModel(config: ModelConfig) {
    return new ChatOllama({
      model: config?.model?.name || 'rolandroland/llama3.1-uncensored:latest',
      temperature: config?.temperature || 0,
    });
  }
}

export default OllamaProvider;