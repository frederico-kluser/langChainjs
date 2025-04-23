import 'dotenv/config';
import { ChatDeepSeek } from "@langchain/deepseek";
import { ModelConfig } from '../types';
import { BaseLLMProvider } from './base-provider';

class DeepSeekProvider extends BaseLLMProvider {
  protected readonly providerName = 'DeepSeek';

  async createModel(config: ModelConfig) {
    return new ChatDeepSeek({
      model: config?.model?.name || "deepseek-chat",
      temperature: config?.temperature || 0,
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }
}

export default DeepSeekProvider;