// filepath: /Volumes/Extension/Projects/pr-advanced-ping-35/claude.ts
import 'dotenv/config';
import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

// Configurando o modelo Claude
const model = new ChatAnthropic({
  model: "claude-3-sonnet-20240229", // Você pode usar outros modelos do Claude disponíveis
  maxTokens: 1000, // Limitando a resposta a 1000 tokens
  temperature: 0.1, // Baixa temperatura para respostas mais consistentes
});

// Definindo a ferramenta para estruturar a resposta em JSON
const estructuredResponse = tool(
  async ({ query }) => {
    // Esta ferramenta é apenas para estruturação da resposta
    return `Resposta estruturada para: "${query}"`;
  },
  {
    name: "estruturar_resposta",
    description: "Estrutura a resposta em formato JSON com informações sobre o tema solicitado",
    schema: z.object({
      query: z.string().describe("A pergunta ou tema que precisa de uma resposta estruturada"),
    }),
  }
);

// Criando um parser de JSON simples
const outputParser = new JsonOutputParser();

// Criando o agente ReAct que utilizará o Claude
const agent = createReactAgent({
  llm: model,
  tools: [estructuredResponse],
  // Definindo um prompt personalizado para o agente
  agentState: {
    createSystemPrompt: () => `Você é um assistente útil que responde perguntas de forma clara e concisa.
Você SEMPRE deve retornar suas respostas no seguinte formato JSON:
{
  "resposta": "Sua resposta aqui com no máximo 1000 caracteres"
}

Nunca se desvie deste formato. Nunca inclua explicações fora do JSON.
Se a pergunta for sobre um tema específico, forneça informações relevantes e precisas.
Suas respostas devem ser informativas, mas limitadas a 1000 caracteres.`,
  },
} as any);

// Função principal para invocar o agente
async function getStructuredResponse(query: string) {
  try {
    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    });
    
    // Extraindo a última mensagem do assistente
    const lastMessage = result.messages[result.messages.length - 1];
    
    // Tentando analisar o conteúdo como JSON
    try {
      let content = lastMessage.content.toString();
      
      // Se o conteúdo contiver blocos de código, extrair apenas o JSON
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        content = jsonMatch[0].replace(/```json|```/g, '').trim();
      }
      
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Erro ao analisar JSON:", parseError);
      return { 
        resposta: "Ocorreu um erro ao processar a resposta em formato JSON. " +
                 "A resposta recebida foi: " + lastMessage.content
      };
    }
  } catch (error) {
    console.error("Erro ao invocar o agente:", error);
    return { resposta: "Ocorreu um erro ao processar sua solicitação." };
  }
}

// Executando o código
const query = 'Me fale sobre os Estados Unidos';
const result = await getStructuredResponse(query);
console.log(result);
