// filepath: /Volumes/Extension/Projects/pr-advanced-ping-35/index.ts
import 'dotenv/config';
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { OutputFixingParser, StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

// Definindo o esquema da resposta usando Zod para validação
const responseSchema = z.object({
  resposta: z.string().describe("Uma resposta detalhada à pergunta, limitada a 1000 caracteres")
});

// Criando um parser para garantir que a saída esteja formatada como JSON
const parser = StructuredOutputParser.fromZodSchema(responseSchema);

// Parser de backup para corrigir erros de formato no JSON
const outputFixingParser = OutputFixingParser.fromParser(parser);

// Instruções de formatação para incluir no prompt
const formatInstructions = parser.getFormatInstructions();

// Configurando o modelo Ollama local com limite de tokens
const llm = new ChatOllama({
  model: "llama3_1_zero_temperature", // Usando modelo local LLaMA 3.1
  temperature: 0.1, // Baixa temperatura para respostas mais consistentes
  maxTokens: 1000, // Limitando a resposta a 1000 tokens
});

// Criando o template do prompt com instruções de formatação
const promptTemplate = PromptTemplate.fromTemplate(`
Responda a pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ter no máximo 1000 caracteres.

{formatInstructions}

Pergunta: {question}
`);

// Função para processar a pergunta e obter resposta
async function getStructuredResponse(question) {
  try {
    // Criando o prompt completo com a pergunta e instruções de formatação
    const prompt = await promptTemplate.format({
      question,
      formatInstructions,
    });
    
    // Invocando o modelo com o prompt
    const response = await llm.invoke(prompt);
    
    // Processando a resposta para extrair o JSON
    const parsedResponse = await outputFixingParser.parse(response.content);
    
    return parsedResponse;
  } catch (error) {
    console.error("Erro ao processar a resposta:", error);
    return { resposta: "Ocorreu um erro ao processar a resposta." };
  }
}

// Invocando o modelo e obtendo a resposta em JSON
const result = await getStructuredResponse('Me fale sobre os Estados Unidos');
console.log(result);