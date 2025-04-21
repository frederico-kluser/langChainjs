import 'dotenv/config';
import { getStructuredResponse as getClaudeResponse } from './claude';
import { getStructuredResponse as getOpenAIResponse } from './openai';
import { getStructuredResponse as getGeminiResponse } from './gemini';
import { getStructuredResponse as getDeepSeekResponse } from './deepseek';
import { getStructuredResponse as getOllamaResponse } from './ollama';
import { LLMResponse } from './types';

async function main() {
	const query = 'Me fale sobre os Estados Unidos';

	console.log('\n=== CLAUDE ===');
	const claudeResult = await getClaudeResponse(query);
	console.log(claudeResult);

	console.log('\n=== OPENAI ===');
	const openaiResult = await getOpenAIResponse(query);
	console.log(openaiResult);

	console.log('\n=== GEMINI ===');
	try {
		const geminiResult = await getGeminiResponse(query);
		console.log(geminiResult);
	} catch (error) {
		console.error('Erro com Gemini:', (error as any).message);
	}

	console.log('\n=== DEEPSEEK ===');
	try {
		const deepseekResult = await getDeepSeekResponse(query);
		console.log(deepseekResult);
	} catch (error) {
		console.error('Erro com DeepSeek:', (error as any).message);
	}

	console.log('\n=== OLLAMA ===');
	try {
		const ollamaResult = await getOllamaResponse(query);
		console.log(ollamaResult);
	} catch (error) {
		console.error('Erro com Ollama:', (error as any).message);
	}
}

main().catch(console.error);
