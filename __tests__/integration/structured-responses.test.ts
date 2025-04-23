import getAIResponse from '../../src/index';
import { ModelType } from '../../src/types';

// Estes testes são usados para verificar se a biblioteca está 
// funcionando corretamente com os modelos reais para respostas estruturadas.
// ATENÇÃO: Eles dependem de chaves de API disponíveis no .env
// e podem consumir tokens/créditos.

// Configuração para pular testes dependendo de variáveis de ambiente
const shouldSkipLiveTests = process.env.SKIP_LIVE_TESTS === 'true';
const testOrSkip = shouldSkipLiveTests ? test.skip : test;

describe('Respostas estruturadas da API', () => {
  const prompt = 'Qual é a capital do Brasil? Responda apenas com o nome da cidade.';
  const timeout = 30000; // 30 segundos por teste
  
  // Schema básico para respostas
  const schema = {
    resposta: 'nome da capital'
  };
  
  // Schema mais complexo
  const complexSchema = {
    capital: 'nome da capital',
    pais: 'nome do país',
    continente: 'nome do continente',
    populacao: 'população aproximada da capital'
  };
  
  // Claude com schema básico
  testOrSkip('Claude com schema simples', async () => {
    const response = await getAIResponse<{ resposta: string }>(prompt, {
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest' as any
      },
      outputSchema: schema
    });
    
    expect(typeof response).toBe('object');
    expect(response.resposta.toLowerCase()).toContain('brasília');
  }, timeout);
  
  // OpenAI com schema básico
  testOrSkip('OpenAI com schema simples', async () => {
    const response = await getAIResponse<{ resposta: string }>(prompt, {
      model: {
        provider: ModelType.OPENAI,
        name: 'gpt-4o-mini' as any
      },
      outputSchema: schema
    });
    
    expect(typeof response).toBe('object');
    expect(response.resposta.toLowerCase()).toContain('brasília');
  }, timeout);
  
  // Schema mais complexo
  testOrSkip('Resposta com schema complexo', async () => {
    const complexPrompt = 'Qual é a capital do Brasil? Forneça informações adicionais.';
    
    const response = await getAIResponse<{
      capital: string,
      pais: string,
      continente: string,
      populacao: number
    }>(complexPrompt, {
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest' as any
      },
      outputSchema: complexSchema
    });
    
    expect(typeof response).toBe('object');
    expect(response.capital.toLowerCase()).toContain('brasília');
    expect(response.pais.toLowerCase()).toContain('brasil');
    expect(response.continente.toLowerCase()).toContain('américa');
    expect(typeof response.populacao).toBe('number');
    expect(response.populacao).toBeGreaterThan(1000000);
  }, timeout);
  
  // Testes em inglês com schema
  testOrSkip('Schema estruturado em inglês', async () => {
    const englishPrompt = 'What is the capital of Brazil? Provide additional information.';
    const englishSchema = {
      capital: 'name of the capital',
      country: 'name of the country',
      population: 'approximate population of the capital'
    };
    
    const response = await getAIResponse<{
      capital: string,
      country: string,
      population: number
    }>(englishPrompt, {
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest' as any
      },
      language: 'en',
      outputSchema: englishSchema
    });
    
    expect(typeof response).toBe('object');
    expect(response.capital.toLowerCase()).toContain('brasília');
    expect(response.country.toLowerCase()).toContain('brazil');
    expect(typeof response.population).toBe('number');
  }, timeout);
});