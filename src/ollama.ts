import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { LLMResponse, ModelConfig } from './types';
import { getPromptTemplate, getParser } from './utils';

// Mensagens de erro por idioma
const errorMessages = {
  pt: "Ocorreu um erro ao processar a resposta com Ollama.",
  en: "An error occurred while processing your response with Ollama."
};

export async function createOllamaModel(options?: { temperature?: number }) {
  return new ChatOllama({
    model: 'rolandroland/llama3.1-uncensored:latest',
    temperature: options?.temperature || 0,
  });
}

export async function getStructuredResponse(
  query: string, 
  config?: ModelConfig
): Promise<LLMResponse> {
  try {
    const language = config?.language || 'pt';
    const lang = language === 'en' ? 'en' : 'pt';
    
    const llm = await createOllamaModel();
    
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
    
    const parsed = await customParser.parse(content);
    
    // Campo resposta pode ser diferente dependendo do idioma
    if (lang === 'pt' && 'resposta' in parsed) {
      return parsed.resposta;
    } else if (lang === 'en' && 'response' in parsed) {
      return parsed.response;
    } else {
      // Fallback para qualquer conteúdo
      return content;
    }
  } catch (error) {
    const lang = (config?.language === 'en') ? 'en' : 'pt';
    console.error(lang === 'pt' ? 'Erro ao processar a resposta com Ollama:' : 'Error processing response with Ollama:', error);
    return errorMessages[lang];
  }
}