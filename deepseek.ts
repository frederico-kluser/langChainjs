import 'dotenv/config';
import { ChatDeepSeek } from "@langchain/deepseek";
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
const llm = new ChatDeepSeek({
  model: "deepseek-chat", // ou "deepseek-reasoner" se preferir
  temperature: 0,
  apiKey: process.env.DEEPSEEK_API_KEY,
  // outros parâmetros se necessário
});

const res = await llm.invoke([
  ["system", "Você é um assistente útil."],
  ["human", "Me fale sobre os Estados Unidos"]
]);
console.log(res.content);
