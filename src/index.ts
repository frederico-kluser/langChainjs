import 'dotenv/config';
import { LLMResponse, ModelConfig, ModelType } from './types';
import llmService from './service/llm-service';
import { populate } from 'dotenv';

/**
 * Obtém resposta estruturada de qualquer modelo de IA
 * @param prompt O prompt ou pergunta a ser enviada para o modelo
 * @param modelType O tipo de modelo a ser utilizado (default: Claude)
 * @param config Configurações opcionais para o modelo (temperature, maxTokens, outputSchema)
 * @returns Resposta estruturada com o campo "resposta"
 */
export async function getAIResponse<T = string>(
	prompt: string,
	modelType: ModelType = ModelType.CLAUDE,
	config?: ModelConfig,
): Promise<LLMResponse<T>> {
	return llmService.getResponse<T>(prompt, modelType, config);
}

// Exemplo de uso como script
async function main() {
	const query = 'Me fale sobre os Estados Unidos';

	// Exemplo com schema personalizado
	interface CountryInfo {
		name: string;
	}

	console.log(`\n=== Consultando modelo: ${ModelType.DEEPSEEK} com schema personalizado ===`);
	const structuredResult = await getAIResponse<CountryInfo>(
		'Provide information about the United States in a structured format',
		ModelType.DEEPSEEK,
		{
			temperature: 0,
			outputSchema: {
				name: 'Official name of the country',
				populate: 'Population of the country',
				area: 'Area of the country in square kilometers',
			},
			language: 'en',
		},
	);
	console.log(structuredResult);

	// Outros exemplos:
	// const openaiResult = await getAIResponse(query, ModelType.OPENAI);
	// const geminiResult = await getAIResponse(query, ModelType.GEMINI);
	// const deepseekResult = await getAIResponse(query, ModelType.DEEPSEEK);
}

// Executar como script standalone
if (import.meta.url === import.meta.resolve('./index.ts')) {
	main().catch(console.error);
}

// Exportar a função principal para uso como módulo
export default getAIResponse;
