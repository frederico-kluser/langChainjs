import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { getJsonSchema, createCustomJsonSchema, extractJsonResponse } from '../utils';

// Mensagens de erro por idioma
const errorMessages = {
  pt: "Ocorreu um erro ao processar sua solicitação com OpenAI.",
  en: "An error occurred while processing your request with OpenAI."
};

class OpenAIProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    const language = config?.language || 'pt';
    const lang = language === 'en' ? 'en' : 'pt';
    
    const llm = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-0125",
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0,
    });

    // Usa schema personalizado se fornecido, ou o schema padrão
    const schema = config?.outputSchema 
      ? createCustomJsonSchema(config.outputSchema, language)
      : getJsonSchema(language);

    const functionCallingModel = llm.bind({
      functions: [schema],
      function_call: { name: lang === 'pt' ? "resposta" : "response" }
    });

    const outputParser = new JsonOutputFunctionsParser();
    return functionCallingModel.pipe(outputParser);
  }

  async getResponse<T = string>(query: string, config?: ModelConfig): Promise<LLMResponse<T>> {
    try {
      const language = config?.language || 'pt';
      const lang = language === 'en' ? 'en' : 'pt';
      
      const chain = await this.createModel(config);
      const result = await chain.invoke(query) as any;
      
      // Para schemas personalizados
      if (config?.outputSchema) {
        if ((lang === 'pt' && result.resposta && typeof result.resposta === 'object') ||
            (lang === 'en' && result.response && typeof result.response === 'object')) {
          return (lang === 'pt' ? result.resposta : result.response) as T;
        }
        // Já está no formato correto
        return result as T;
      }
      
      // Para resposta de texto simples
      if ((lang === 'pt' && result.resposta && typeof result.resposta === 'string') ||
          (lang === 'en' && result.response && typeof result.response === 'string')) {
        return (lang === 'pt' ? result.resposta : result.response) as T;
      }
      
      return result as T;
    } catch (error) {
      const lang = (config?.language === 'en') ? 'en' : 'pt';
      console.error(lang === 'pt' ? "Erro ao invocar o modelo OpenAI:" : "Error invoking the OpenAI model:", error);
      return errorMessages[lang] as T;
    }
  }
}

export default OpenAIProvider;