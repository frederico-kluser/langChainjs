import 'dotenv/config';
import { ChatAnthropic } from "@langchain/anthropic";
import { ILLMProvider, LLMResponse, ModelConfig } from '../types';
import { systemPrompt } from '../utils';

class ClaudeProvider implements ILLMProvider {
  async createModel(config?: ModelConfig) {
    return new ChatAnthropic({
      model: "claude-3-sonnet-20240229",
      maxTokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0.1,
    });
  }

  async getResponse(query: string, config?: ModelConfig): Promise<LLMResponse> {
    try {
      const model = await this.createModel(config);
      
      const response = await model.invoke([
        ["system", systemPrompt],
        ["human", `Responda à pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ter no máximo 1000 caracteres.

Pergunta: ${query}`]
      ]);

      try {
        // Convertendo para string para garantir compatibilidade
        const contentStr = response.content.toString();
        
        // Procura por padrões JSON na resposta
        const jsonMatch = contentStr.match(/```json\s*([\s\S]*?)\s*```/) || 
                         contentStr.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          const jsonContent = jsonMatch[0].replace(/```json|```/g, '').trim();
          const parsedJson = JSON.parse(jsonContent);
          
          if (parsedJson.resposta) {
            return parsedJson;
          }
        }

        // Se não conseguiu extrair JSON válido ou não tem campo 'resposta', 
        // retorna o texto diretamente
        return { 
          resposta: contentStr.replace(/```json|```/g, '').trim()
        };
      } catch (jsonError) {
        // Se falhar ao processar como JSON, retorna o texto bruto como string
        return { resposta: response.content.toString() };
      }
    } catch (error) {
      console.error("Erro ao invocar o modelo Claude:", error);
      return { resposta: "Ocorreu um erro ao processar sua solicitação com Claude." };
    }
  }
}

export default ClaudeProvider;