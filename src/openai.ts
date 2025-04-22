import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { LLMResponse } from './types';
import { jsonSchema } from './utils';

export async function createOpenAIModel(options?: { maxTokens?: number; temperature?: number }) {
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0125",
    maxTokens: options?.maxTokens || 1000,
    temperature: options?.temperature || 0,
  });

  const functionCallingModel = llm.bind({
    functions: [jsonSchema],
    function_call: { name: "resposta" }
  });

  const outputParser = new JsonOutputFunctionsParser();
  return functionCallingModel.pipe(outputParser);
}

export async function getStructuredResponse(query: string): Promise<LLMResponse> {
  try {
    const chain = await createOpenAIModel();
    const result = await chain.invoke(query) as any;
    
    // Garantir que a resposta está no formato esperado
    if (typeof result === 'object' && result.resposta) {
      return result.resposta;
    }
    
    return typeof result === 'string' ? result : JSON.stringify(result);
  } catch (error) {
    console.error("Erro ao invocar o modelo OpenAI:", error);
    return "Ocorreu um erro ao processar sua solicitação com OpenAI.";
  }
}