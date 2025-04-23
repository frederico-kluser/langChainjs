import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { getSystemPrompt, extractJsonResponse, createCustomJsonSchema } from '../utils';

// Mensagens por idioma
const messages = {
  pt: {
    humanPromptIntro: 'Responda à pergunta abaixo.',
    structuredResponse: 'A resposta deve ser estruturada conforme solicitado.',
    simpleResponse: 'Responda de forma clara e concisa.',
    questionPrefix: 'Pergunta:',
    error: 'Ocorreu um erro ao processar sua solicitação com OpenAI.'
  },
  en: {
    humanPromptIntro: 'Answer the question below.',
    structuredResponse: 'The response must be structured as requested.',
    simpleResponse: 'Answer clearly and concisely.',
    questionPrefix: 'Question:',
    error: 'An error occurred while processing your request with OpenAI.'
  }
};

class OpenAIProvider implements ILLMProvider {
  async createModel(config: ModelConfig) {
    const language = config?.language || 'pt';
    const lang = language === 'en' ? 'en' : 'pt';
    
    const llm = new ChatOpenAI({
      modelName: config?.model?.name || "gpt-3.5-turbo-0125",
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0,
    });

    // Se tem schema personalizado, use function calling
    if (config?.outputSchema) {
      const schema = createCustomJsonSchema(config.outputSchema, language);
      const functionCallingModel = llm.bind({
        functions: [schema],
        function_call: { name: lang === 'pt' ? "resposta" : "response" }
      });
      return functionCallingModel.pipe(new JsonOutputFunctionsParser());
    }
    
    // Caso contrário, retorne o modelo regular
    return llm;
  }

  async getResponse<T = string>(query: string, config: ModelConfig): Promise<LLMResponse<T>> {
    try {
      const language = config?.language || 'pt';
      const lang = language === 'en' ? 'en' : 'pt';
      const msg = messages[lang];
      
      const model = await this.createModel(config);
      
      // Se estamos usando function calling (output schema)
      if (config?.outputSchema) {
        const result = await model.invoke(query) as any;
        
        // Extrair a resposta do formato de function calling
        if ((lang === 'pt' && result.resposta) || (lang === 'en' && result.response)) {
          return (lang === 'pt' ? result.resposta : result.response) as T;
        }
        
        return result as T;
      }
      
      // Para resposta simples usando prompt padrão
      const customPrompt = getSystemPrompt(undefined, language);
      
      const response = await model.invoke([
        ["system", customPrompt],
        ["human", `${msg.humanPromptIntro}
${msg.simpleResponse}

${msg.questionPrefix} ${query}`]
      ]);

      return response.content.toString() as T;
    } catch (error) {
      const lang = config?.language === 'en' ? 'en' : 'pt';
      console.error(lang === 'pt' ? 'Erro ao invocar o modelo OpenAI:' : 'Error invoking the OpenAI model:', error);
      return messages[lang].error as T;
    }
  }
}

export default OpenAIProvider;