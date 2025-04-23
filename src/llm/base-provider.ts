import 'dotenv/config';
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { getSystemPrompt, extractJsonResponse, getLanguage } from '../utils';

// Mensagens comuns para todos os providers
const messagesBase = {
  pt: {
    humanPromptIntro: 'Responda à pergunta abaixo.',
    structuredResponse: 'A resposta deve ser estruturada conforme solicitado.',
    simpleResponse: 'Responda de forma clara e concisa.',
    questionPrefix: 'Pergunta:',
    parseError: 'Falha ao parsear resposta JSON, usando conteúdo direto',
  },
  en: {
    humanPromptIntro: 'Answer the question below.',
    structuredResponse: 'The response must be structured as requested.',
    simpleResponse: 'Answer clearly and concisely.',
    questionPrefix: 'Question:',
    parseError: 'Failed to parse JSON response, using direct content',
  }
};

/**
 * Classe abstrata base para todos os providers de LLM
 * Implementa lógica comum para evitar duplicação de código
 */
export abstract class BaseLLMProvider implements ILLMProvider {
  /**
   * Nome do provedor para mensagens de erro
   */
  protected abstract readonly providerName: string;

  /**
   * Mensagens específicas do provedor incluindo erros
   */
  protected messages = {
    pt: {
      ...messagesBase.pt,
      error: `Ocorreu um erro ao processar sua solicitação.`
    },
    en: {
      ...messagesBase.en,
      error: `An error occurred while processing your request.`
    }
  };

  constructor() {
    // Atualiza as mensagens de erro com o nome do provedor
    this.updateErrorMessages();
  }

  /**
   * Atualiza as mensagens de erro com o nome do provedor
   */
  protected updateErrorMessages(): void {
    this.messages.pt.error = `Ocorreu um erro ao processar sua solicitação com ${this.providerName}.`;
    this.messages.en.error = `An error occurred while processing your request with ${this.providerName}.`;
  }

  /**
   * Determina o idioma a ser usado
   */
  protected getLanguage(config?: ModelConfig): 'pt' | 'en' {
    return getLanguage(config?.language);
  }

  /**
   * Cria uma instância do modelo
   * Deve ser implementado por cada provedor específico
   */
  abstract createModel(config: ModelConfig): Promise<any>;

  /**
   * Método para obter resposta do LLM
   * Implementação comum para a maioria dos provedores
   */
  async getResponse<T = string>(query: string, config: ModelConfig): Promise<LLMResponse<T>> {
    try {
      const lang = this.getLanguage(config);
      const msg = this.messages[lang];
      
      const model = await this.createModel(config);
      
      // Usa o prompt personalizado ou o padrão
      const customPrompt = getSystemPrompt(config?.outputSchema, lang);
      
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
      return extractJsonResponse<T>(content, config?.outputSchema, lang);
    } catch (error) {
      return this.handleError<T>(error, config);
    }
  }

  /**
   * Tratamento de erro padrão
   */
  protected handleError<T>(error: unknown, config?: ModelConfig): LLMResponse<T> {
    const lang = this.getLanguage(config);
    console.error(
      lang === 'pt' 
        ? `Erro ao invocar o modelo ${this.providerName}:` 
        : `Error invoking the ${this.providerName} model:`, 
      error
    );
    return this.messages[lang].error as T;
  }
}