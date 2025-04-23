import 'dotenv/config';
import { ChatAnthropic } from '@langchain/anthropic';
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { getSystemPrompt, extractJsonResponse } from '../utils';

// Mensagens por idioma
const messages = {
  pt: {
    humanPromptIntro: 'Responda à pergunta abaixo.',
    structuredResponse: 'A resposta deve ser estruturada conforme solicitado.',
    simpleResponse: 'Responda de forma clara e concisa.',
    questionPrefix: 'Pergunta:',
    error: 'Ocorreu um erro ao processar sua solicitação com Claude.'
  },
  en: {
    humanPromptIntro: 'Answer the question below.',
    structuredResponse: 'The response must be structured as requested.',
    simpleResponse: 'Answer clearly and concisely.',
    questionPrefix: 'Question:',
    error: 'An error occurred while processing your request with Claude.'
  }
};

class ClaudeProvider implements ILLMProvider {
  async createModel(config: ModelConfig) {
    return new ChatAnthropic({
      model: config?.model?.name || 'claude-3-sonnet-20240229',
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0.1,
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
        ['system', customPrompt],
        [
          'human',
          `${msg.humanPromptIntro}
${config?.outputSchema ? msg.structuredResponse : msg.simpleResponse}

${msg.questionPrefix} ${query}`,
        ],
      ]);

      const content = response.content.toString();

      // Para resposta não estruturada (texto simples)
      if (!config?.outputSchema) {
        return content as T;
      }

      // Para resposta estruturada com schema
      return extractJsonResponse<T>(content, config?.outputSchema, language);
    } catch (error) {
      const lang = config?.language === 'en' ? 'en' : 'pt';
      console.error(lang === 'pt' ? 'Erro ao invocar o modelo Claude:' : 'Error invoking the Claude model:', error);
      return messages[lang].error as T;
    }
  }
}

export default ClaudeProvider;