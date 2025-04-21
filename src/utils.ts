import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

export const responseSchema = z.object({
  resposta: z.string().describe('A detailed answer to the question, limited to 1000 characters'),
});

export const parser = StructuredOutputParser.fromZodSchema(responseSchema);
export const formatInstructions = parser.getFormatInstructions();

export const systemPrompt = `Você é um assistente útil que responde perguntas de forma clara e concisa.
Você SEMPRE deve retornar suas respostas no seguinte formato JSON:
{
  "resposta": "Sua resposta aqui com no máximo 1000 caracteres"
}

Nunca se desvie deste formato. Nunca inclua explicações fora do JSON.
Se a pergunta for sobre um tema específico, forneça informações relevantes e precisas.
Suas respostas devem ser informativas, mas limitadas a 1000 caracteres.`;

export const promptTemplate = PromptTemplate.fromTemplate(`Responda à pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ter no máximo 1000 caracteres.

{formatInstructions}

Pergunta: {question}`);

export const jsonSchema = {
  name: "resposta",
  description: "Forneça uma resposta clara e concisa à pergunta",
  parameters: {
    type: "object",
    properties: {
      resposta: {
        type: "string",
        description: "A resposta detalhada à pergunta, limitada a 1000 caracteres"
      }
    },
    required: ["resposta"]
  }
};

export async function extractJsonResponse(content: string | any): Promise<{ resposta: string }> {
  try {
    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }
    
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                     content.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      content = jsonMatch[0].replace(/```json|```/g, '').trim();
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Erro ao analisar JSON:", error);
    return { 
      resposta: "Ocorreu um erro ao processar a resposta em formato JSON."
    };
  }
}