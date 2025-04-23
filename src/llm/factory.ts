import { ILLMProvider, ModelType } from "../types";
import ClaudeProvider from "./claude-provider";
import OpenAIProvider from "./openai-provider";
import GeminiProvider from "./gemini-provider";
import DeepSeekProvider from "./deepseek-provider";
import OllamaProvider from "./ollama-provider";

/**
 * Factory que cria a instância apropriada do provider de LLM 
 * baseado no tipo de modelo fornecido
 */
export class LLMProviderFactory {
  private static providers: Map<ModelType, ILLMProvider> = new Map();

  /**
   * Obtém ou cria uma instância do provider LLM
   * @param type Tipo do modelo (CLAUDE, OPENAI, GEMINI, etc)
   * @returns Instância do provider
   */
  static getProvider(type: ModelType): ILLMProvider {
    if (!this.providers.has(type)) {
      this.providers.set(type, this.createProvider(type));
    }
    return this.providers.get(type)!;
  }

  /**
   * Cria uma nova instância do provider
   */
  private static createProvider(type: ModelType): ILLMProvider {
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
        throw new Error(`Provider não implementado para o tipo ${type}`);
    }
  }
}