// filepath: /Volumes/Extension/Projects/pr-advanced-ping-35/index.ts
import 'dotenv/config';
import { ChatOllama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

/*
tenho que garantir que essa caceta roda offline pqp
*/

// Definindo o esquema da resposta usando Zod para validação
const responseSchema = z.object({
	resposta: z.string().describe('A detailed answer to the question, limited to 1000 characters'),
});

// Criando um parser para garantir que a saída esteja formatada como JSON
const parser = StructuredOutputParser.fromZodSchema(responseSchema);

// Instruções de formatação para incluir no prompt
const formatInstructions = parser.getFormatInstructions();

// Configurando o modelo Ollama local com limite de tokens
const llm = new ChatOllama({
	model: 'rolandroland/llama3.1-uncensored:latest', // Usando modelo local LLaMA 3.1
	temperature: 0, // Baixa temperatura para respostas mais consistentes
});

// Criando o template do prompt com instruções de formatação
const promptTemplate =
	PromptTemplate.fromTemplate(`Responda à pergunta abaixo e retorne a resposta em um formato JSON específico.
A resposta deve ter no máximo 100 caracteres.

{formatInstructions}

Pergunta: {question}`);

// Função para processar a pergunta e obter resposta
async function getStructuredResponse(question: any) {
	try {
		// Criando o prompt completo com a pergunta e instruções de formatação
		const prompt = await promptTemplate.format({
			question,
			formatInstructions,
		});

		// Invocando o modelo com o prompt
		const response = await llm.invoke(prompt);

		// Processando a resposta para extrair o JSON
		const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
		const parsedResponse = await parser.parse(content);

		return parsedResponse;
	} catch (error) {
		console.error('Erro ao processar a resposta:', error);
		return { resposta: 'Ocorreu um erro ao processar a resposta.' };
	}
}

// Invocando o modelo e obtendo a resposta em JSON
const result = await getStructuredResponse('Me fale sobre os Estados Unidos');
console.log(result);
