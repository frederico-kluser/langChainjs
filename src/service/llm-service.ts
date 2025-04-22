import { LLMResponse, ModelConfig, ModelType } from '../types';
import LLMFactory from '../llm/factory';

// Mensagens de erro por idioma
const errorMessages = {
  pt: {
    processingError: (modelType: string) => `Ocorreu um erro ao processar a solicitação com o modelo ${modelType}.`
  },
  en: {
    processingError: (modelType: string) => `An error occurred while processing the request with the ${modelType} model.`
  }
};

class LLMService {
  async getResponse<T = string>(
    prompt: string, 
    modelType: ModelType = ModelType.CLAUDE,
    config?: ModelConfig
  ): Promise<LLMResponse<T>> {
    // Definir idioma padrão como português se não especificado
    const language = config?.language || 'pt';
    const lang = language === 'en' ? 'en' : 'pt';
    
    try {
      const provider = LLMFactory.getProvider(modelType);
      return await provider.getResponse<T>(prompt, config);
    } catch (error) {
      console.error(
        `${lang === 'pt' ? 'Erro ao processar a resposta com o modelo' : 'Error processing response with model'} ${modelType}:`, 
        error
      );
      return errorMessages[lang].processingError(modelType) as T;
    }
  }
}

export default new LLMService();