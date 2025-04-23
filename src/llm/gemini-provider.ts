import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { getSystemPrompt, extractJsonResponse } from '../utils';

// Mensagens por idioma
const messages = {
  pt: {
    humanPromptIntro: 'Responda à pergunta abaixo.',
    structuredResponse: 'A resposta deve ser estruturada conforme solicitado.',
    simpleResponse: 'Responda de forma clara e concisa.',
    questionPrefix: 'Pergunta:',
    error: 'Ocorreu um erro ao processar sua solicitação com Gemini.'
  },
  en: {
    humanPromptIntro: 'Answer the question below.',
    structuredResponse: 'The response must be structured as requested.',
    simpleResponse: 'Answer clearly and concisely.',
    questionPrefix: 'Question:',
    error: 'An error occurred while processing your request with Gemini.'
  }
};

class GeminiProvider implements ILLMProvider {
  async createModel(config: ModelConfig) {
    return new ChatGoogleGenerativeAI({
      model: config?.model?.name || "gemini-1.5-flash",
      temperature: config?.temperature || 0,
      apiKey: process.env.GEMINI_API_KEY,
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

      const content = response.content.toString();

      // Para resposta não estruturada (texto simples)
      if (!config?.outputSchema) {
        return content as T;
      }

      // Para resposta estruturada com schema
      return extractJsonResponse<T>(content, config?.outputSchema, language);
    } catch (error) {
      const lang = config?.language === 'en' ? 'en' : 'pt';
      console.error(lang === 'pt' ? 'Erro ao invocar o modelo Gemini:' : 'Error invoking the Gemini model:', error);
      return messages[lang].error as T;
    }
  }
}

export default GeminiProvider;