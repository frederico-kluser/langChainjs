import llmService from '../../src/service/llm-service';
import { LLMProviderFactory } from '../../src/llm/factory';
import { ModelType } from '../../src/types';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mocking dependências
vi.mock('../../src/llm/factory', () => ({
  LLMProviderFactory: {
    getProvider: vi.fn()
  }
}));

// O mock de ora deve ser hoisted antes de ser usado
vi.mock('ora', () => {
  const mockSucceed = vi.fn().mockReturnThis();
  const mockFail = vi.fn().mockReturnThis();
  const mockStart = vi.fn().mockReturnThis();
  
  const oraMock = vi.fn().mockImplementation(() => ({
    start: mockStart,
    succeed: mockSucceed,
    fail: mockFail,
  }));
  
  return {
    default: oraMock,
    mockSucceed,
    mockFail,
    mockStart
  };
});

// Importar os mocks
import { mockSucceed, mockFail } from 'ora';

describe('LLMService', () => {
  // Mock do provider
  const mockProvider = {
    getResponse: vi.fn()
  };
  
  // Setup mocks
  beforeEach(() => {
    vi.clearAllMocks();
    (LLMProviderFactory.getProvider as any).mockReturnValue(mockProvider);
  });

  test('obtém o provider correto baseado no tipo de modelo', async () => {
    mockProvider.getResponse.mockResolvedValueOnce('Resposta de teste');
    
    await llmService.getResponse('Qual a capital do Brasil?', {
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest' as any
      }
    });
    
    expect(LLMProviderFactory.getProvider).toHaveBeenCalledWith(ModelType.CLAUDE);
    expect(mockProvider.getResponse).toHaveBeenCalled();
  });

  test('passa os parâmetros corretos para o provider', async () => {
    mockProvider.getResponse.mockResolvedValueOnce('Resposta de teste');
    
    const prompt = 'Qual a capital do Brasil?';
    const config = {
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest' as any
      },
      temperature: 0.7,
      maxTokens: 500,
      language: 'pt' as const
    };
    
    await llmService.getResponse(prompt, config);
    
    expect(mockProvider.getResponse).toHaveBeenCalledWith(prompt, config);
  });

  test('retorna a resposta do provider quando sucesso', async () => {
    const expectedResponse = 'Brasília é a capital do Brasil';
    mockProvider.getResponse.mockResolvedValueOnce(expectedResponse);
    
    const result = await llmService.getResponse('Qual a capital do Brasil?', {
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest' as any
      }
    });
    
    expect(result).toBe(expectedResponse);
    expect(mockSucceed).toHaveBeenCalled();
  });

  test('captura e processa erros adequadamente', async () => {
    mockProvider.getResponse.mockRejectedValueOnce(new Error('Erro de API'));
    
    const result = await llmService.getResponse('Qual a capital do Brasil?', {
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest' as any
      }
    });
    
    expect(typeof result).toBe('string');
    expect(result).toContain('Ocorreu um erro');
    expect(mockFail).toHaveBeenCalled();
  });

  test('mensagens de erro são retornadas em inglês quando idioma é "en"', async () => {
    mockProvider.getResponse.mockRejectedValueOnce(new Error('API error'));
    
    const result = await llmService.getResponse('What is the capital of Brazil?', {
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest' as any
      },
      language: 'en' as const
    });
    
    expect(typeof result).toBe('string');
    expect(result).toContain('An error occurred');
    expect(mockFail).toHaveBeenCalled();
  });
});