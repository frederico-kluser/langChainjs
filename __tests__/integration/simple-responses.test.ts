import getAIResponse from '../../src/index';
import { ModelType } from '../../src/types';

// Estes testes são usados para verificar se a biblioteca está 
// funcionando corretamente com os modelos reais.
// ATENÇÃO: Eles dependem de chaves de API disponíveis no .env
// e podem consumir tokens/créditos.

// Configuração para pular testes dependendo de variáveis de ambiente
const shouldSkipLiveTests = process.env.SKIP_LIVE_TESTS === 'true';
const testOrSkip = shouldSkipLiveTests ? test.skip : test;

describe('Respostas simples da API', () => {
  const prompt = 'Qual é a capital do Brasil? Responda apenas com o nome da cidade.';
  const timeout = 30000; // 30 segundos por teste
  
  // Claude
  testOrSkip('Claude responde corretamente', async () => {
    const response = await getAIResponse(prompt, {
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest' as any
      }
    });
    
    expect(typeof response).toBe('string');
    expect(response.toLowerCase()).toContain('brasília');
  }, timeout);
  
  // OpenAI
  testOrSkip('OpenAI responde corretamente', async () => {
    const response = await getAIResponse(prompt, {
      model: {
        provider: ModelType.OPENAI,
        name: 'gpt-4o-mini' as any
      }
    });
    
    expect(typeof response).toBe('string');
    expect(response.toLowerCase()).toContain('brasília');
  }, timeout);
  
  // Gemini
  testOrSkip('Gemini responde corretamente', async () => {
    const response = await getAIResponse(prompt, {
      model: {
        provider: ModelType.GEMINI,
        name: 'gemini-2.0-flash' as any
      }
    });
    
    expect(typeof response).toBe('string');
    expect(response.toLowerCase()).toContain('brasília');
  }, timeout);
  
  // Testes em inglês
  testOrSkip('Responde corretamente em inglês', async () => {
    const englishPrompt = 'What is the capital of Brazil? Answer only with the name of the city.';
    
    const response = await getAIResponse(englishPrompt, {
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest' as any
      },
      language: 'en'
    });
    
    expect(typeof response).toBe('string');
    expect(response.toLowerCase()).toContain('brasília');
  }, timeout);
});