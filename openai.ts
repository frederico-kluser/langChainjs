import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

// Definindo a estrutura do JSON que queremos receber
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

// Configurando o modelo com o limite de 1000 tokens e formato JSON
const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-0125", // Usando um modelo compatível com funções
  maxTokens: 1000,
});

// Adicionando o parser de JSON
const functionCallingModel = llm.bind({
  functions: [jsonSchema],
  function_call: { name: "resposta" }
});

const outputParser = new JsonOutputFunctionsParser();

// Encadeando o modelo com o parser
const chain = functionCallingModel.pipe(outputParser);

// Invocando o modelo e obtendo a resposta em JSON
const result = await chain.invoke('Me fale sobre os Estados Unidos');
console.log(result);