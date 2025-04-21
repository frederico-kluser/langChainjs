import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { jsonSchema } from '../utils';

class OpenAIProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    const llm = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-0125",
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0,
    });

    const functionCallingModel = llm.bind({
      functions: [jsonSchema],
      function_call: { name: "resposta" }
    });

    const outputParser = new JsonOutputFunctionsParser();
    return functionCallingModel.pipe(outputParser);
  }

  async getResponse(query: string, config?: ModelConfig): Promise<LLMResponse> {
    try {
      const chain = await this.createModel(config);
      const result = await chain.invoke(query) as any;
      
      // Garantir que a resposta está no formato esperado
      if (typeof result === 'object' && !result.resposta) {
        return { resposta: JSON.stringify(result) };
      }
      
      return result as LLMResponse;
    } catch (error) {
      console.error("Erro ao invocar o modelo OpenAI:", error);
      return { resposta: "Ocorreu um erro ao processar sua solicitação com OpenAI." };
    }
  }
}

export default OpenAIProvider;