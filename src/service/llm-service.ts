import { LLMResponse, ModelConfig, ModelType } from '../types';
import LLMFactory from '../llm/factory';

class LLMService {
  async getResponse<T = string>(
    prompt: string, 
    modelType: ModelType = ModelType.CLAUDE,
    config?: ModelConfig
  ): Promise<LLMResponse<T>> {
    try {
      const provider = LLMFactory.getProvider(modelType);
      return await provider.getResponse<T>(prompt, config);
    } catch (error) {
      console.error(`Erro ao processar a resposta com o modelo ${modelType}:`, error);
      return `Ocorreu um erro ao processar a solicitação com o modelo ${modelType}.` as T;
    }
  }
}

export default new LLMService();