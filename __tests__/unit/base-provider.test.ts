import { BaseLLMProvider } from '../../src/llm/base-provider';
import { ModelConfig } from '../../src/types';

// Mock da classe abstrata BaseLLMProvider para testes
class TestProvider extends BaseLLMProvider {
  protected readonly providerName = 'TestProvider';
  
  async createModel(config: ModelConfig) {
    return {
      invoke: vi.fn().mockResolvedValue({
        content: 'Resposta de teste'
      })
    };
  }
}

describe('BaseLLMProvider', () => {
  let provider: TestProvider;
  let consoleSpy: any;

  beforeEach(() => {
    provider = new TestProvider();
    // Forçar uma chamada ao updateErrorMessages para garantir que os nomes estejam atualizados
    provider['updateErrorMessages']();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('getLanguage', () => {
    test('retorna "pt" quando não é especificado idioma', () => {
      const config: ModelConfig = {
        model: { provider: 'claude' as any, name: 'test' as any }
      };
      // @ts-ignore - Acessando método protegido para testar
      const language = provider.getLanguage(config);
      expect(language).toBe('pt');
    });

    test('retorna "en" quando idioma é especificado como "en"', () => {
      const config: ModelConfig = {
        language: 'en',
        model: { provider: 'claude' as any, name: 'test' as any }
      };
      // @ts-ignore - Acessando método protegido para testar
      const language = provider.getLanguage(config);
      expect(language).toBe('en');
    });

    test('retorna "pt" quando idioma é especificado como "pt"', () => {
      const config: ModelConfig = {
        language: 'pt',
        model: { provider: 'claude' as any, name: 'test' as any }
      };
      // @ts-ignore - Acessando método protegido para testar
      const language = provider.getLanguage(config);
      expect(language).toBe('pt');
    });
  });

  describe('handleError', () => {
    test('retorna mensagem de erro em português por padrão', () => {
      const error = new Error('Erro de teste');
      const config: ModelConfig = {
        model: { provider: 'claude' as any, name: 'test' as any }
      };
      
      // @ts-ignore - Acessando método protegido para testar
      const errorMessage = provider.handleError(error, config);
      
      expect(typeof errorMessage).toBe('string');
      expect(errorMessage).toContain('Ocorreu um erro');
      expect(errorMessage).toContain('TestProvider');
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('retorna mensagem de erro em inglês quando idioma é "en"', () => {
      const error = new Error('Test error');
      const config: ModelConfig = {
        language: 'en',
        model: { provider: 'claude' as any, name: 'test' as any }
      };
      
      // @ts-ignore - Acessando método protegido para testar
      const errorMessage = provider.handleError(error, config);
      
      expect(typeof errorMessage).toBe('string');
      expect(errorMessage).toContain('An error occurred');
      expect(errorMessage).toContain('TestProvider');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});