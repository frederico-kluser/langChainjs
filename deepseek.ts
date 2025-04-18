import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

// Exemplo DeepSeek com LangChain.js
const jsonSchema = {
  name: "resposta",
  description: "retorne uma intro a cultura americana",
  parameters: {
    type: "object",
    properties: {
      resposta: {
        type: "string",
        description: "A resposta"
      }
    },
    required: ["resposta"]
  }
};

// Configurando o modelo DeepSeek (substitua pelo provider correto se houver um pacote específico)
const llm = new ChatOpenAI({
  modelName: "deepseek-chat", // Nome do modelo DeepSeek
  maxTokens: 1000,
  openAIApiKey: process.env.DEEPSEEK_API_KEY, // Usando a key do DeepSeek
  baseURL: "https://api.deepseek.com/v1" // Endpoint DeepSeek (ajuste se necessário)
});

const functionCallingModel = llm.bind({
  functions: [jsonSchema],
  function_call: { name: "resposta" }
});

const outputParser = new JsonOutputFunctionsParser();
const chain = functionCallingModel.pipe(outputParser);

const result = await chain.invoke('Me fale sobre os Estados Unidos');
console.log(result);
