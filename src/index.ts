import 'dotenv/config';
import { LLMResponse, ModelConfig, ModelType } from './types';
import llmService from './service/llm-service';

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
	interface PaisInfo {
		nome: string;
		capital: string;
		populacao: number;
		idioma: string;
	}

	console.log(`\n=== Consultando modelo: ${ModelType.OLLAMA} com schema personalizado ===`);
	const resultadoEstruturado = await getAIResponse<PaisInfo>(
		'Forneça informações sobre os Estados Unidos em formato estruturado',
		ModelType.OLLAMA,
		{
			temperature: 0,
			outputSchema: {
				nome: 'Nome oficial do país',
				capital: 'Capital do país',
				populacao: 'População total em números',
				idioma: 'Idioma oficial principal',
			},
		},
	);
	console.log(resultadoEstruturado);

	console.log(`\n=== Consultando modelo: ${ModelType.CLAUDE} com texto simples ===`);
	const respostaTexto = await getAIResponse<string>(
		query,
		ModelType.CLAUDE,
	);
	console.log(respostaTexto);

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
