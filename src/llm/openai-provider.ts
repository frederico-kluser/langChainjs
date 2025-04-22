import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { jsonSchema, createCustomJsonSchema, extractJsonResponse } from '../utils';

class OpenAIProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    const llm = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-0125",
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0,
    });

    // Usa schema personalizado se fornecido, ou o schema padrão
    const schema = config?.outputSchema 
      ? createCustomJsonSchema(config.outputSchema)
      : jsonSchema;

    const functionCallingModel = llm.bind({
      functions: [schema],
      function_call: { name: "resposta" }
    });

    const outputParser = new JsonOutputFunctionsParser();
    return functionCallingModel.pipe(outputParser);
  }

  async getResponse<T = string>(query: string, config?: ModelConfig): Promise<LLMResponse<T>> {
    try {
      const chain = await this.createModel(config);
      const result = await chain.invoke(query) as any;
      
      // Se for uma resposta estruturada
      if (config?.outputSchema && result.resposta && typeof result.resposta === 'object') {
        return result as LLMResponse<T>;
      }
      
      // Garantir que a resposta está no formato esperado
      if (typeof result === 'object' && !result.resposta) {
        return { resposta: result as T };
      }
      
      return result as LLMResponse<T>;
    } catch (error) {
      console.error("Erro ao invocar o modelo OpenAI:", error);
      return { resposta: "Ocorreu um erro ao processar sua solicitação com OpenAI." as T };
    }
  }
}

export default OpenAIProvider;