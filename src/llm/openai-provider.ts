import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { LLMResponse, ModelConfig } from '../types';
import { getSystemPrompt, createCustomJsonSchema } from '../utils';
import { BaseLLMProvider } from './base-provider';

/**
 * Provider do OpenAI com implementação especial para function calling
 */
class OpenAIProvider extends BaseLLMProvider {
  protected readonly providerName = 'OpenAI';

  async createModel(config: ModelConfig) {
    const language = this.getLanguage(config);
    
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
        function_call: { name: language === 'pt' ? "resposta" : "response" }
      });
      return functionCallingModel.pipe(new JsonOutputFunctionsParser());
    }
    
    // Caso contrário, retorne o modelo regular
    return llm;
  }

  /**
   * Implementação especializada para suportar function calling do OpenAI
   */
  async getResponse<T = string>(query: string, config: ModelConfig): Promise<LLMResponse<T>> {
    try {
      const lang = this.getLanguage(config);
      const msg = this.messages[lang];
      
      const model = await this.createModel(config);
      
      // Se estamos usando function calling (output schema)
      if (config?.outputSchema) {
        const result = await model.invoke(query) as any;
        
        // Com function calling, já temos o objeto JSON
        return result as T;
      }
      
      // Para resposta simples usando prompt padrão
      const customPrompt = getSystemPrompt(undefined, lang);
      
      const response = await model.invoke([
        ["system", customPrompt],
        ["human", `${msg.humanPromptIntro}
${msg.simpleResponse}

${msg.questionPrefix} ${query}`]
      ]);

      return response.content.toString() as T;
    } catch (error) {
      return this.handleError<T>(error, config);
    }
  }
}

export default OpenAIProvider;