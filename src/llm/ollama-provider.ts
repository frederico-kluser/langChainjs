import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { promptTemplate, parser, extractJsonResponse, getSystemPrompt } from '../utils';

class OllamaProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    return new ChatOllama({
      model: 'rolandroland/llama3.1-uncensored:latest',
      temperature: config?.temperature || 0,
    });
  }

  async getResponse<T = string>(query: string, config?: ModelConfig): Promise<LLMResponse<T>> {
    try {
      const llm = await this.createModel(config);
      
      // Para schemas personalizados, usamos uma abordagem direta
      if (config?.outputSchema) {
        const customPrompt = getSystemPrompt(config.outputSchema);
        
        const response = await llm.invoke([
          ["system", customPrompt],
          ["human", `Responda à pergunta com dados estruturados conforme solicitado. 
Pergunta: ${query}`]
        ]);
        
        const content = typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);
          
        return extractJsonResponse<T>(content, config.outputSchema);
      }
      
      // Para resposta em texto simples
      const prompt = await promptTemplate.format({
        question: query,
        formatInstructions: parser.getFormatInstructions(),
      });

      const response = await llm.invoke(prompt);
      const content = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
      
      // Tenta extrair o texto da resposta
      try {
        const parsed = await parser.parse(content);
        if (parsed && parsed.resposta) {
          return parsed.resposta as T;
        }
      } catch (parseError) {
        // Se falhar ao parsear, retorna o conteúdo bruto
        console.log("Falha ao parsear resposta JSON, usando conteúdo direto");
      }
      
      // Se o parser falhar ou não tiver uma resposta estruturada, retorna o conteúdo como está
      return content as T;
    } catch (error) {
      console.error('Erro ao processar a resposta com Ollama:', error);
      return 'Ocorreu um erro ao processar a resposta com Ollama.' as T;
    }
  }
}

export default OllamaProvider;