import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

export const responseSchema = z.object({
  resposta: z.string().describe('A detailed answer to the question, limited to 1000 characters'),
});

export const parser = StructuredOutputParser.fromZodSchema(responseSchema);
export const formatInstructions = parser.getFormatInstructions();

export function getSystemPrompt(outputSchema?: Record<string, any>): string {
  if (!outputSchema) {
    return `Você é um assistente útil que responde perguntas de forma clara e concisa.
Você SEMPRE deve retornar suas respostas no seguinte formato JSON:
{
  "resposta": "Sua resposta aqui com no máximo 1000 caracteres"
}

Nunca se desvie deste formato. Nunca inclua explicações fora do JSON.
Se a pergunta for sobre um tema específico, forneça informações relevantes e precisas.
Suas respostas devem ser informativas, mas limitadas a 1000 caracteres.`;
  }

  // Constrói o prompt para formato de saída personalizado
  const schemaFields = Object.entries(outputSchema)
    .map(([key, desc]) => `    "${key}": ${typeof desc === 'string' ? `"${desc}"` : desc}`)
    .join(',\n');

  return `Você é um assistente útil que responde perguntas de forma estruturada.
Você SEMPRE deve retornar suas respostas no seguinte formato JSON:
{
  "resposta": {
${schemaFields}
  }
}

Nunca se desvie deste formato. Nunca inclua explicações fora do JSON.
Se a pergunta for sobre um tema específico, forneça informações relevantes e precisas nos campos especificados.`;
}

// Sistema prompt padrão para compatibilidade
export const systemPrompt = getSystemPrompt();

export const promptTemplate = PromptTemplate.fromTemplate(`Responda à pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ser estruturada conforme solicitado.

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

export function createCustomJsonSchema(outputSchema: Record<string, any>) {
  // Cria um schema personalizado para function calling
  const properties: Record<string, any> = {};
  
  // Para cada campo no schema de saída, cria uma propriedade correspondente
  Object.entries(outputSchema).forEach(([key, description]) => {
    // Determina o tipo baseado na descrição ou formato
    let type = "string";
    if (key.includes("numero") || key.includes("populacao") || key.includes("quantidade")) {
      type = "number";
    } else if (key.endsWith("s") && !key.endsWith("pais") && !key.endsWith("mes")) {
      // Arrays geralmente têm nomes no plural
      type = "array";
    }
    
    if (type === "array") {
      properties[key] = {
        type: "array",
        items: { type: "string" },
        description: description
      };
    } else {
      properties[key] = {
        type: type,
        description: description
      };
    }
  });

  return {
    name: "resposta",
    description: "Forneça uma resposta estruturada à pergunta",
    parameters: {
      type: "object",
      properties: {
        resposta: {
          type: "object",
          properties: properties,
          required: Object.keys(properties)
        }
      },
      required: ["resposta"]
    }
  };
}

export async function extractJsonResponse<T = string>(
  content: string | any, 
  outputSchema?: Record<string, any>
): Promise<{ resposta: T }> {
  try {
    if (typeof content !== 'string') {
      content = JSON.stringify(content);
    }
    
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                     content.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      content = jsonMatch[0].replace(/```json|```/g, '').trim();
    }
    
    const parsedContent = JSON.parse(content);
    
    // Verifica se já está no formato esperado
    if (parsedContent.resposta) {
      return parsedContent as { resposta: T };
    } 
    
    // Verifica se este é o conteúdo estruturado que deveria estar dentro de resposta
    if (outputSchema && typeof parsedContent === 'object') {
      const schemaKeys = Object.keys(outputSchema);
      const contentKeys = Object.keys(parsedContent);
      
      // Se o objeto analisado contém a maioria das chaves do schema, assume que é o conteúdo estruturado
      const matchingKeys = schemaKeys.filter(key => contentKeys.includes(key));
      if (matchingKeys.length >= schemaKeys.length * 0.5) {
        return { resposta: parsedContent as T };
      }
    }
    
    // Se não está em nenhum formato reconhecido, converte para string
    return { 
      resposta: (typeof parsedContent === 'string' 
        ? parsedContent 
        : JSON.stringify(parsedContent, null, 2)) as T
    };
  } catch (error) {
    console.error("Erro ao analisar JSON:", error);
    return { 
      resposta: "Ocorreu um erro ao processar a resposta em formato JSON." as T
    };
  }
}