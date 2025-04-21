import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { LLMResponse } from './types';
import { promptTemplate, parser } from './utils';

export async function createOllamaModel(options?: { temperature?: number }) {
  return new ChatOllama({
    model: 'rolandroland/llama3.1-uncensored:latest',
    temperature: options?.temperature || 0,
  });
}

export async function getStructuredResponse(query: string): Promise<LLMResponse> {
  try {
    const llm = await createOllamaModel();
    
    const prompt = await promptTemplate.format({
      question: query,
      formatInstructions: parser.getFormatInstructions(),
    });

    const response = await llm.invoke(prompt);
    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
    
    return await parser.parse(content);
  } catch (error) {
    console.error('Erro ao processar a resposta com Ollama:', error);
    return { resposta: 'Ocorreu um erro ao processar a resposta com Ollama.' };
  }
}