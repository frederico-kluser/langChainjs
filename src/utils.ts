import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

export const responseSchema = z.object({
  resposta: z.string().describe('A detailed answer to the question, limited to 1000 characters'),
});

// Schemas personalizados por idioma
const responseSchemas = {
  pt: z.object({
    resposta: z.string().describe('A detailed answer to the question, limited to 1000 characters'),
  }),
  en: z.object({
    response: z.string().describe('A detailed answer to the question, limited to 1000 characters'),
  })
};

export function getParser(language: string = 'pt') {
  const lang = language === 'en' ? 'en' : 'pt';
  return StructuredOutputParser.fromZodSchema(responseSchemas[lang]);
}

export const parser = getParser();
export const formatInstructions = parser.getFormatInstructions();

// Definição dos prompts por idioma
const systemPrompts = {
  pt: {
    default: `Você é um assistente útil que responde perguntas de forma clara e concisa.
Você SEMPRE deve retornar suas respostas como uma string simples, limitada a 1000 caracteres.

Nunca inclua explicações fora da resposta solicitada.
Se a pergunta for sobre um tema específico, forneça informações relevantes e precisas.
Suas respostas devem ser informativas, mas limitadas a 1000 caracteres.`,
    
    structured: (schemaFields: string) => `Você é um assistente útil que responde perguntas de forma estruturada.
Você SEMPRE deve retornar suas respostas no seguinte formato JSON:
{
${schemaFields}
}

Nunca se desvie deste formato. Nunca inclua explicações fora do JSON.
Se a pergunta for sobre um tema específico, forneça informações relevantes e precisas nos campos especificados.`
  },
  
  en: {
    default: `You are a helpful assistant that answers questions clearly and concisely.
You MUST ALWAYS return your responses as a simple string, limited to 1000 characters.

Never include explanations outside the requested response.
If the question is about a specific topic, provide relevant and accurate information.
Your answers should be informative, but limited to 1000 characters.`,
    
    structured: (schemaFields: string) => `You are a helpful assistant that answers questions in a structured way.
You MUST ALWAYS return your responses in the following JSON format:
{
${schemaFields}
}

Never deviate from this format. Never include explanations outside the JSON.
If the question is about a specific topic, provide relevant and accurate information in the specified fields.`
  }
};

export function getSystemPrompt(outputSchema?: Record<string, any>, language: string = 'pt'): string {
  // Verificar se o idioma é suportado, caso contrário usar português
  const lang = language === 'en' ? 'en' : 'pt';
  
  if (!outputSchema) {
    return systemPrompts[lang].default;
  }

  // Constrói o prompt para formato de saída personalizado
  const schemaFields = Object.entries(outputSchema)
    .map(([key, desc]) => `  "${key}": ${typeof desc === 'string' ? `"${desc}"` : desc}`)
    .join(',\n');

  return systemPrompts[lang].structured(schemaFields);
}

// Sistema prompt padrão para compatibilidade
export const systemPrompt = getSystemPrompt();

// Templates de prompt por idioma
const promptTemplates = {
  pt: `Responda à pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ser estruturada conforme solicitado.

{formatInstructions}

Pergunta: {question}`,

  en: `Answer the question below and return the response in a specific JSON format.
The response must be structured as requested.

{formatInstructions}

Question: {question}`
};

export function getPromptTemplate(language: string = 'pt'): PromptTemplate {
  const lang = language === 'en' ? 'en' : 'pt';
  return PromptTemplate.fromTemplate(promptTemplates[lang]);
}

// Prompt template padrão para compatibilidade
export const promptTemplate = getPromptTemplate();

// JSON schemas para cada idioma
const jsonSchemas = {
  pt: {
    name: "resposta",
    description: "Forneça uma resposta clara e concisa à pergunta",
    parameters: {
      type: "string",
      description: "A resposta detalhada à pergunta, limitada a 1000 caracteres"
    }
  },
  en: {
    name: "response",
    description: "Provide a clear and concise answer to the question",
    parameters: {
      type: "string",
      description: "The detailed answer to the question, limited to 1000 characters"
    }
  }
};

export function getJsonSchema(language: string = 'pt') {
  const lang = language === 'en' ? 'en' : 'pt';
  return jsonSchemas[lang];
}

// JSON schema padrão para compatibilidade
export const jsonSchema = getJsonSchema();

export function createCustomJsonSchema(outputSchema: Record<string, any>, language: string = 'pt') {
  // Cria um schema personalizado para function calling
  const properties: Record<string, any> = {};
  const lang = language === 'en' ? 'en' : 'pt';
  
  // Para cada campo no schema de saída, cria uma propriedade correspondente
  Object.entries(outputSchema).forEach(([key, description]) => {
    // Determina o tipo baseado na descrição ou formato
    let type = "string";
    
    // Regras para detectar números em português e inglês
    if (lang === 'pt' && (
        key.includes("numero") || key.includes("populacao") || key.includes("quantidade") || 
        key.includes("valor") || key.includes("total") || key.includes("idade")
      )) {
      type = "number";
    } else if (lang === 'en' && (
        key.includes("number") || key.includes("population") || key.includes("quantity") || 
        key.includes("amount") || key.includes("value") || key.includes("total") || 
        key.includes("age") || key.includes("count")
      )) {
      type = "number";
    }
    
    // Regras para detectar arrays em português e inglês
    if ((lang === 'pt' && key.endsWith("s") && !key.endsWith("pais") && !key.endsWith("mes")) ||
        (lang === 'en' && key.endsWith("s") && !key.endsWith("status") && !key.endsWith("address"))) {
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

  const schemaDescriptions = {
    pt: "Forneça uma resposta estruturada à pergunta",
    en: "Provide a structured response to the question"
  };

  const schemaNames = {
    pt: "resposta",
    en: "response"
  };

  return {
    name: schemaNames[lang],
    description: schemaDescriptions[lang],
    parameters: {
      type: "object",
      properties: properties,
      required: Object.keys(properties)
    }
  };
}

// Mensagens de erro por idioma
const errorMessages = {
  pt: {
    jsonParseError: "Ocorreu um erro ao processar a resposta em formato JSON."
  },
  en: {
    jsonParseError: "An error occurred while processing the JSON format response."
  }
};

export async function extractJsonResponse<T = string>(
  content: string | any, 
  outputSchema?: Record<string, any>,
  language: string = 'pt'
): Promise<T> {
  const lang = language === 'en' ? 'en' : 'pt';
  
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
    
    // Verifica se já está em formato de objeto e tem o schema esperado
    if (outputSchema && typeof parsedContent === 'object') {
      const schemaKeys = Object.keys(outputSchema);
      const contentKeys = Object.keys(parsedContent);
      
      // Se o objeto analisado contém a maioria das chaves do schema
      const matchingKeys = schemaKeys.filter(key => contentKeys.includes(key));
      if (matchingKeys.length >= schemaKeys.length * 0.5) {
        return parsedContent as T;
      }
    }
    
    // Para resposta string simples
    if (!outputSchema && typeof parsedContent === 'object') {
      // Verifica o campo resposta em português ou response em inglês
      if ((lang === 'pt' && parsedContent.resposta) || 
          (lang === 'en' && parsedContent.response)) {
        return (lang === 'pt' ? parsedContent.resposta : parsedContent.response) as T;
      }
    }
    
    // Se não está em nenhum formato reconhecido, retorna como está
    return (typeof parsedContent === 'string' 
      ? parsedContent as T
      : parsedContent as T);
  } catch (error) {
    console.error(`${lang === 'pt' ? 'Erro ao analisar JSON:' : 'Error parsing JSON:'}`, error);
    return errorMessages[lang].jsonParseError as T;
  }
}