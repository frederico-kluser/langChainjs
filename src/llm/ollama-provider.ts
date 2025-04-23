import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { getSystemPrompt, extractJsonResponse } from '../utils';

// Mensagens por idioma
const messages = {
  pt: {
    humanPromptIntro: 'Responda à pergunta abaixo.',
    structuredResponse: 'A resposta deve ser estruturada conforme solicitado.',
    simpleResponse: 'Responda de forma clara e concisa.',
    questionPrefix: 'Pergunta:',
    parseError: 'Falha ao parsear resposta JSON, usando conteúdo direto',
    error: 'Ocorreu um erro ao processar sua solicitação com Ollama.'
  },
  en: {
    humanPromptIntro: 'Answer the question below.',
    structuredResponse: 'The response must be structured as requested.',
    simpleResponse: 'Answer clearly and concisely.',
    questionPrefix: 'Question:',
    parseError: 'Failed to parse JSON response, using direct content',
    error: 'An error occurred while processing your request with Ollama.'
  }
};

class OllamaProvider implements ILLMProvider {
  async createModel(config: ModelConfig) {
    return new ChatOllama({
      model: config?.model?.name || 'rolandroland/llama3.1-uncensored:latest',
      temperature: config?.temperature || 0,
    });
  }

  async getResponse<T = string>(query: string, config: ModelConfig): Promise<LLMResponse<T>> {
    try {
      // Definir idioma padrão como português se não especificado
      const language = config?.language || 'pt';
      const lang = language === 'en' ? 'en' : 'pt';
      const msg = messages[lang];
      
      const model = await this.createModel(config);
      
      // Usa o prompt personalizado ou o padrão
      const customPrompt = getSystemPrompt(config?.outputSchema, language);
      
      const response = await model.invoke([
        ["system", customPrompt],
        ["human", `${msg.humanPromptIntro}
${config?.outputSchema ? msg.structuredResponse : msg.simpleResponse}

${msg.questionPrefix} ${query}`]
      ]);

      const content = typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);

      // Para resposta não estruturada (texto simples)
      if (!config?.outputSchema) {
        return content as T;
      }

      // Para resposta estruturada com schema
      return extractJsonResponse<T>(content, config?.outputSchema, language);
    } catch (error) {
      const lang = config?.language === 'en' ? 'en' : 'pt';
      console.error(lang === 'pt' ? 'Erro ao invocar o modelo Ollama:' : 'Error invoking the Ollama model:', error);
      return messages[lang].error as T;
    }
  }
}

export default OllamaProvider;