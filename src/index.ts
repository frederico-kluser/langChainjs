import 'dotenv/config';
import { LLMResponse, ModelConfig, ModelType } from './types';
import llmService from './service/llm-service';
import { populate } from 'dotenv';

/**
 * Obtém resposta estruturada de qualquer modelo de IA
 * @param prompt O prompt ou pergunta a ser enviada para o modelo
 * @param config Configurações do modelo (model, temperature, maxTokens, outputSchema, language)
 * @returns Resposta estruturada com o campo "resposta"
 */
export async function getAIResponse<T = string>(prompt: string, config?: ModelConfig): Promise<LLMResponse<T>> {
	return llmService.getResponse<T>(
		prompt,
		config || {
			model: {
				provider: ModelType.OPENAI,
				name: 'gpt-4o',
			},
			outputSchema: {
				resposta: 'string',
			},
		},
	);
}

// Exemplo de uso como script
async function main() {
	// Exemplo com schema personalizado
	interface CountryInfo {
		name: string;
		populate: string;
		area: string;
	}

	const structuredResult = await getAIResponse<CountryInfo>(
		'Provide information about the United States in a structured format',
	);
	console.log(structuredResult);
}

// Executar como script standalone
if (import.meta.url === import.meta.resolve('./index.ts')) {
	main().catch(console.error);
}

// Exportar a função principal para uso como módulo
export default getAIResponse;
