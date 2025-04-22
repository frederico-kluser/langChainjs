import { ILLMProvider, ModelType } from '../types';
import ClaudeProvider from './claude-provider';
import OpenAIProvider from './openai-provider';
import GeminiProvider from './gemini-provider';
import DeepSeekProvider from './deepseek-provider';
import OllamaProvider from './ollama-provider';

class LLMFactory {
  static getProvider(type: ModelType): ILLMProvider {
    switch (type) {
      case ModelType.CLAUDE:
        return new ClaudeProvider();
      case ModelType.OPENAI:
        return new OpenAIProvider();
      case ModelType.GEMINI:
        return new GeminiProvider();
      case ModelType.DEEPSEEK:
        return new DeepSeekProvider();
      case ModelType.OLLAMA:
        return new OllamaProvider();
      default:
        throw new Error(`Provedor não suportado: ${type}`);
    }
  }
}

export default LLMFactory;