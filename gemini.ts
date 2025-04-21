import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

async function main() {
  // Exemplo Gemini com LangChain.js
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

  // Configurando o modelo Gemini
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-pro",
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY,
  });

  const res = await llm.invoke([
    ["system", "Você é um assistente útil."],
    ["human", "Me fale sobre os Estados Unidos"]
  ]);
  console.log(res.content);
}

main().catch(console.error);