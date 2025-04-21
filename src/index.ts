import 'dotenv/config';
import { ModelConfig, ModelType } from './types';
import llmService from './service/llm-service';

/**
 * Obtém resposta estruturada de qualquer modelo de IA
 * @param prompt O prompt ou pergunta a ser enviada para o modelo
 * @param modelType O tipo de modelo a ser utilizado (default: Claude)
 * @param config Configurações opcionais para o modelo (temperature, maxTokens)
 * @returns Resposta estruturada com o campo "resposta"
 */
export async function getAIResponse(
  prompt: string,
  modelType: ModelType = ModelType.CLAUDE,
  config?: ModelConfig
) {
  return llmService.getResponse(prompt, modelType, config);
}

// Exemplo de uso como script
async function main() {
  const query = 'Me fale sobre os Estados Unidos';
  
  console.log(`\n=== Consultando modelo: ${ModelType.CLAUDE} ===`);
  const result = await getAIResponse(query, ModelType.CLAUDE);
  console.log(result);
  
  // Exemplo de como selecionar diferentes modelos:
  // const openaiResult = await getAIResponse(query, ModelType.OPENAI);
  // const geminiResult = await getAIResponse(query, ModelType.GEMINI);
  // const deepseekResult = await getAIResponse(query, ModelType.DEEPSEEK);
  // const ollamaResult = await getAIResponse(query, ModelType.OLLAMA);
}

// Executar como script standalone
if (import.meta.url === import.meta.resolve('./index.ts')) {
  main().catch(console.error);
}

// Exportar a função principal para uso como módulo
export default getAIResponse;