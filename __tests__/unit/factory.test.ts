import { LLMProviderFactory } from '../../src/llm/factory';
import { ModelType } from '../../src/types';
import ClaudeProvider from '../../src/llm/claude-provider';
import OpenAIProvider from '../../src/llm/openai-provider';
import GeminiProvider from '../../src/llm/gemini-provider';
import DeepSeekProvider from '../../src/llm/deepseek-provider';
import OllamaProvider from '../../src/llm/ollama-provider';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mockando todos os providers para evitar inicializações reais
vi.mock('../../src/llm/claude-provider', () => ({
  default: vi.fn().mockImplementation(() => ({
    getResponse: vi.fn(),
    createModel: vi.fn()
  }))
}));
vi.mock('../../src/llm/openai-provider', () => ({
  default: vi.fn().mockImplementation(() => ({
    getResponse: vi.fn(),
    createModel: vi.fn()
  }))
}));
vi.mock('../../src/llm/gemini-provider', () => ({
  default: vi.fn().mockImplementation(() => ({
    getResponse: vi.fn(),
    createModel: vi.fn()
  }))
}));
vi.mock('../../src/llm/deepseek-provider', () => ({
  default: vi.fn().mockImplementation(() => ({
    getResponse: vi.fn(),
    createModel: vi.fn()
  }))
}));
vi.mock('../../src/llm/ollama-provider', () => ({
  default: vi.fn().mockImplementation(() => ({
    getResponse: vi.fn(),
    createModel: vi.fn()
  }))
}));

describe('LLMProviderFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Resetar o Map interno entre os testes
    // @ts-ignore - Acessando propriedade privada para testar
    LLMProviderFactory.providers = new Map();
  });

  test('retorna uma instância de ClaudeProvider quando tipo é CLAUDE', () => {
    const provider = LLMProviderFactory.getProvider(ModelType.CLAUDE);
    expect(provider).toBeDefined();
    expect(ClaudeProvider).toHaveBeenCalledTimes(1);
  });

  test('retorna uma instância de OpenAIProvider quando tipo é OPENAI', () => {
    const provider = LLMProviderFactory.getProvider(ModelType.OPENAI);
    expect(provider).toBeDefined();
    expect(OpenAIProvider).toHaveBeenCalledTimes(1);
  });

  test('retorna uma instância de GeminiProvider quando tipo é GEMINI', () => {
    const provider = LLMProviderFactory.getProvider(ModelType.GEMINI);
    expect(provider).toBeDefined();
    expect(GeminiProvider).toHaveBeenCalledTimes(1);
  });

  test('retorna uma instância de DeepSeekProvider quando tipo é DEEPSEEK', () => {
    const provider = LLMProviderFactory.getProvider(ModelType.DEEPSEEK);
    expect(provider).toBeDefined();
    expect(DeepSeekProvider).toHaveBeenCalledTimes(1);
  });

  test('retorna uma instância de OllamaProvider quando tipo é OLLAMA', () => {
    const provider = LLMProviderFactory.getProvider(ModelType.OLLAMA);
    expect(provider).toBeDefined();
    expect(OllamaProvider).toHaveBeenCalledTimes(1);
  });

  test('reutiliza a mesma instância quando chamado múltiplas vezes com o mesmo tipo', () => {
    const provider1 = LLMProviderFactory.getProvider(ModelType.CLAUDE);
    const provider2 = LLMProviderFactory.getProvider(ModelType.CLAUDE);
    
    expect(provider1).toBe(provider2); // Mesma instância
    expect(ClaudeProvider).toHaveBeenCalledTimes(1); // Construtor chamado apenas uma vez
  });

  test('cria diferentes instâncias para diferentes tipos', () => {
    const claudeProvider = LLMProviderFactory.getProvider(ModelType.CLAUDE);
    const openaiProvider = LLMProviderFactory.getProvider(ModelType.OPENAI);
    
    expect(claudeProvider).not.toBe(openaiProvider);
    expect(ClaudeProvider).toHaveBeenCalledTimes(1);
    expect(OpenAIProvider).toHaveBeenCalledTimes(1);
  });
});