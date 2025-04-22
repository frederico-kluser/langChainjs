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
      
      // Para schemas personalizados
      if (config?.outputSchema) {
        if (result.resposta && typeof result.resposta === 'object') {
          return result.resposta as T;
        }
        // Já está no formato correto
        return result as T;
      }
      
      // Para resposta de texto simples
      if (result.resposta && typeof result.resposta === 'string') {
        return result.resposta as T;
      }
      
      return result as T;
    } catch (error) {
      console.error("Erro ao invocar o modelo OpenAI:", error);
      return "Ocorreu um erro ao processar sua solicitação com OpenAI." as T;
    }
  }
}

export default OpenAIProvider;