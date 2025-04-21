import 'dotenv/config';
import { ChatDeepSeek } from "@langchain/deepseek";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

async function main() {
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

  // Configurando o modelo DeepSeek
  const llm = new ChatDeepSeek({
    model: "deepseek-chat",
    temperature: 0,
    apiKey: process.env.DEEPSEEK_API_KEY,
  });

  const res = await llm.invoke([
    ["system", "Você é um assistente útil."],
    ["human", "Me fale sobre os Estados Unidos"]
  ]);
  console.log(res.content);
}

main().catch(console.error);
