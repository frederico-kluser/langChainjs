import { 
  getSystemPrompt, 
  extractJsonResponse, 
  getLanguage 
} from '../../src/utils';
import { describe, expect, test, vi } from 'vitest';

describe('Utils', () => {
  describe('getSystemPrompt', () => {
    test('retorna prompt padrão em português quando não há schema', () => {
      const prompt = getSystemPrompt();
      expect(prompt).toContain('Você é um assistente útil');
      expect(prompt).toContain('responde perguntas de forma clara e concisa');
    });

    test('retorna prompt padrão em inglês quando idioma é "en"', () => {
      const prompt = getSystemPrompt(undefined, 'en');
      expect(prompt).toContain('You are a helpful assistant');
      expect(prompt).toContain('answers questions clearly and concisely');
    });

    test('retorna prompt estruturado com schema personalizado', () => {
      const schema = {
        nome: 'nome completo da pessoa',
        idade: 'idade em anos'
      };
      
      const prompt = getSystemPrompt(schema);
      
      expect(prompt).toContain('nome": "nome completo da pessoa');
      expect(prompt).toContain('idade": "idade em anos');
      expect(prompt).toContain('Nunca se desvie deste formato');
    });
  });

  describe('extractJsonResponse', () => {
    test('extrai corretamente JSON simples', async () => {
      const jsonContent = '{"resposta": "Brasília"}';
      const result = await extractJsonResponse(jsonContent);
      expect(result).toBe('Brasília');
    });

    test('extrai corretamente JSON com schema customizado', async () => {
      const jsonContent = '{"nome": "João Silva", "idade": 30}';
      const schema = { nome: 'nome completo', idade: 'idade em anos' };
      
      const result = await extractJsonResponse(jsonContent, schema);
      
      expect(result).toEqual({
        nome: 'João Silva',
        idade: 30
      });
    });

    test('extrai JSON mesmo com delimitadores markdown', async () => {
      const content = 'Aqui está a resposta:\n```json\n{"resposta": "Brasília"}\n```';
      const result = await extractJsonResponse(content);
      
      expect(result).toBe('Brasília');
    });

    test('retorna mensagem de erro quando o JSON é inválido', async () => {
      // Mock console.error para este teste
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const invalidJson = '{"resposta": "Brasília';
      const result = await extractJsonResponse(invalidJson);
      
      expect(result).toContain('Ocorreu um erro ao processar a resposta');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('retorna mensagem de erro em inglês quando o idioma é "en"', async () => {
      // Mock console.error para este teste
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const invalidJson = '{"resposta": "Brasília';
      const result = await extractJsonResponse(invalidJson, undefined, 'en');
      
      expect(result).toContain('An error occurred');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});