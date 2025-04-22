import { LLMResponse, ModelConfig, ModelType } from '../types';
import LLMFactory from '../llm/factory';

class LLMService {
  async getResponse(
    prompt: string, 
    modelType: ModelType = ModelType.CLAUDE,
    config?: ModelConfig
  ): Promise<LLMResponse> {
    try {
      const provider = LLMFactory.getProvider(modelType);
      return await provider.getResponse(prompt, config);
    } catch (error) {
      console.error(`Erro ao processar a resposta com o modelo ${modelType}:`, error);
      return { 
        resposta: `Ocorreu um erro ao processar a solicitação com o modelo ${modelType}.` 
      };
    }
  }
}

export default new LLMService();