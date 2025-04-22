import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { getPromptTemplate, parser, extractJsonResponse, getSystemPrompt, getParser } from '../utils';

// Mensagens por idioma
const messages = {
  pt: {
    structuredPrompt: "Responda à pergunta com dados estruturados conforme solicitado.",
    questionPrefix: "Pergunta:",
    parseError: "Falha ao parsear resposta JSON, usando conteúdo direto",
    error: "Ocorreu um erro ao processar a resposta com Ollama."
  },
  en: {
    structuredPrompt: "Answer the question with structured data as requested.",
    questionPrefix: "Question:",
    parseError: "Failed to parse JSON response, using direct content",
    error: "An error occurred while processing your response with Ollama."
  }
};

class OllamaProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    return new ChatOllama({
      model: 'rolandroland/llama3.1-uncensored:latest',
      temperature: config?.temperature || 0,
    });
  }

  async getResponse<T = string>(query: string, config?: ModelConfig): Promise<LLMResponse<T>> {
    try {
      // Definir idioma padrão como português se não especificado
      const language = config?.language || 'pt';
      const lang = language === 'en' ? 'en' : 'pt';
      const msg = messages[lang];
      
      const llm = await this.createModel(config);
      
      // Para schemas personalizados, usamos uma abordagem direta
      if (config?.outputSchema) {
        const customPrompt = getSystemPrompt(config.outputSchema, language);
        
        const response = await llm.invoke([
          ["system", customPrompt],
          ["human", `${msg.structuredPrompt} 
${msg.questionPrefix} ${query}`]
        ]);
        
        const content = typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);
          
        return extractJsonResponse<T>(content, config.outputSchema, language);
      }
      
      // Para resposta em texto simples
      const customParser = getParser(language);
      const promptTemplate = getPromptTemplate(language);
      const prompt = await promptTemplate.format({
        question: query,
        formatInstructions: customParser.getFormatInstructions(),
      });

      const response = await llm.invoke(prompt);
      const content = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
      
      // Tenta extrair o texto da resposta
      try {
        const parsed = await customParser.parse(content);
        // Cada idioma tem um parser diferente que retornará o campo correto
        if (parsed) {
          if (lang === 'pt' && 'resposta' in parsed) {
            return parsed.resposta as T;
          } else if (lang === 'en' && 'response' in parsed) {
            return parsed.response as T;
          }
        }
      } catch (parseError) {
        // Se falhar ao parsear, retorna o conteúdo bruto
        console.log(msg.parseError);
      }
      
      // Se o parser falhar ou não tiver uma resposta estruturada, retorna o conteúdo como está
      return content as T;
    } catch (error) {
      const lang = (config?.language === 'en') ? 'en' : 'pt';
      console.error(lang === 'pt' ? 'Erro ao processar a resposta com Ollama:' : 'Error processing response with Ollama:', error);
      return messages[lang].error as T;
    }
  }
}

export default OllamaProvider;