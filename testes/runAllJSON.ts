import 'dotenv/config';
import { ModelType, Models } from '../src/types';
import getAIResponse from '../src/index';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';

// Função para executar cada LLM em paralelo com schema JSON
async function runAllLLMsWithJSONOutput() {
  console.log('🤖 Testando todos os modelos LLM com resposta em JSON 🤖\n');
  
  const prompt = 'Qual é a capital do Brasil? Responda apenas com o nome da cidade.';
  
  // Schema JSON para estruturar a resposta
  const outputSchema = {
    resposta: "nome da capital do Brasil"
  };
  
  // Configuração de cada modelo
  const modelConfigs = [
    {
      name: 'Claude',
      model: {
        provider: ModelType.CLAUDE,
        name: 'claude-3-5-haiku-latest'
      } as Models
    },
    {
      name: 'OpenAI',
      model: {
        provider: ModelType.OPENAI,
        name: 'gpt-4o-mini'
      } as Models
    },
    {
      name: 'Gemini',
      model: {
        provider: ModelType.GEMINI,
        name: 'gemini-2.0-flash'
      } as Models
    },
    {
      name: 'DeepSeek',
      model: {
        provider: ModelType.DEEPSEEK,
        name: 'deepseek-chat'
      } as Models
    },
    {
      name: 'Ollama',
      model: {
        provider: ModelType.OLLAMA,
        name: 'rolandroland/llama3.1-uncensored:latest'
      } as Models
    }
  ];
  
  // Executar todos os modelos em paralelo
  const results = await Promise.allSettled(
    modelConfigs.map(async (config) => {
      const spinner = ora({
        text: `Executando ${config.name} com schema JSON...`,
        color: 'blue'
      }).start();
      
      try {
        const startTime = Date.now();
        // Usamos um tipo genérico para indicar a estrutura esperada da resposta
        const response = await getAIResponse<{ resposta: string }>(
          prompt, 
          { 
            model: config.model,
            outputSchema
          }
        );
        const endTime = Date.now();
        const timeElapsed = (endTime - startTime) / 1000;
        
        spinner.succeed(`${config.name} completado em ${timeElapsed}s`);
        
        return {
          model: config.name,
          response,
          time: timeElapsed,
          timestamp: new Date().toISOString(),
          status: 'success'
        };
      } catch (error) {
        spinner.fail(`${config.name} falhou`);
        return {
          model: config.name,
          error: error instanceof Error ? error.message : String(error),
          time: 0,
          timestamp: new Date().toISOString(),
          status: 'error'
        };
      }
    })
  );
  
  // Formatar resultados para salvar no JSON
  const formattedResults = {
    prompt,
    timestamp: new Date().toISOString(),
    schema: outputSchema,
    results: results.map((result, index) => {
      const modelName = modelConfigs[index].name;
      
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          model: modelName,
          error: String(result.reason),
          time: 0,
          timestamp: new Date().toISOString(),
          status: 'error'
        };
      }
    })
  };
  
  // Salvar resultados em um arquivo JSON
  const resultsDir = path.join(process.cwd(), 'testes', 'resultados');
  try {
    await fs.mkdir(resultsDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filePath = path.join(resultsDir, `resultado-json-teste-${timestamp}.json`);
    await fs.writeFile(filePath, JSON.stringify(formattedResults, null, 2), 'utf8');
    console.log(`\n📄 Resultados salvos em: ${filePath}`);
  } catch (error) {
    console.error('Erro ao salvar resultados:', error);
  }
  
  // Mostrar resultados no console
  console.log('\n📊 Resultados:\n');
  
  results.forEach((result, index) => {
    const modelName = modelConfigs[index].name;
    
    console.log(`\x1b[1m${modelName}:\x1b[0m`);
    
    if (result.status === 'fulfilled') {
      const data = result.value as any;
      if (typeof data.response === 'object') {
        console.log(`  Resposta JSON: \x1b[32m${JSON.stringify(data.response)}\x1b[0m`);
      } else {
        console.log(`  Resposta: \x1b[32m${data.response}\x1b[0m`);
      }
      console.log(`  Tempo: \x1b[33m${data.time}s\x1b[0m`);
    } else {
      console.log(`  \x1b[31mErro: ${result.reason}\x1b[0m`);
    }
    
    console.log(''); // Linha em branco entre resultados
  });
}

// Executar o teste
runAllLLMsWithJSONOutput().catch(error => {
  console.error('Erro ao executar os testes:', error);
  process.exit(1);
});