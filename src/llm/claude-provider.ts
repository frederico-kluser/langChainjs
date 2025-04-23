import 'dotenv/config';
import { ChatAnthropic } from '@langchain/anthropic';
import { ModelConfig } from '../types';
import { BaseLLMProvider } from './base-provider';

class ClaudeProvider extends BaseLLMProvider {
  protected readonly providerName = 'Claude';

  async createModel(config: ModelConfig) {
    return new ChatAnthropic({
      model: config?.model?.name || 'claude-3-sonnet-20240229',
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0.1,
    });
  }
}

export default ClaudeProvider;