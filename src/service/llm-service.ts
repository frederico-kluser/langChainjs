import { LLMResponse, ModelConfig, ModelType } from '../types';
import { LLMProviderFactory } from '../llm/factory';
import ora from 'ora';

// Mensagens de erro por idioma
const errorMessages = {
  pt: {
    processingError: (modelType: string) => `Ocorreu um erro ao processar a solicitação com o modelo ${modelType}.`,
    loading: (modelType: string) => `Gerando resposta com ${modelType}...`
  },
  en: {
    processingError: (modelType: string) => `An error occurred while processing the request with the ${modelType} model.`,
    loading: (modelType: string) => `Generating response with ${modelType}...`
  }
};

class LLMService {
  async getResponse<T = string>(
    prompt: string, 
    config: ModelConfig
  ): Promise<LLMResponse<T>> {
    // Definir idioma padrão como português se não especificado
    const language = config.language || 'pt';
    const lang = language === 'en' ? 'en' : 'pt';
    
    // Determinar o provider a partir do config.model
    const providerType = config.model.provider;
    
    // Criar e iniciar o spinner
    const spinner = ora({
      text: errorMessages[lang].loading(providerType),
      color: 'blue'
    }).start();
    
    try {
      const provider = LLMProviderFactory.getProvider(providerType);
      const response = await provider.getResponse<T>(prompt, config);
      
      // Parar o spinner com sucesso
      spinner.succeed(lang === 'pt' ? 'Resposta gerada com sucesso!' : 'Response successfully generated!');
      
      return response;
    } catch (error) {
      // Parar o spinner com erro
      spinner.fail(lang === 'pt' ? 'Erro ao gerar resposta' : 'Error generating response');
      
      console.error(
        `${lang === 'pt' ? 'Erro ao processar a resposta com o modelo' : 'Error processing response with model'} ${providerType}:`, 
        error
      );
      return errorMessages[lang].processingError(providerType) as T;
    }
  }
}

export default new LLMService();