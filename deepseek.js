"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var openai_1 = require("@langchain/openai");
var output_parsers_1 = require("langchain/output_parsers");
// Exemplo DeepSeek com LangChain.js
var jsonSchema = {
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
var llm = new openai_1.ChatOpenAI({
    modelName: "deepseek-chat", // Nome do modelo DeepSeek
    maxTokens: 1000,
    openAIApiKey: process.env.DEEPSEEK_API_KEY, // Usando a key do DeepSeek
    baseURL: "https://api.deepseek.com/v1" // Endpoint DeepSeek (ajuste se necessário)
});
var functionCallingModel = llm.bind({
    functions: [jsonSchema],
    function_call: { name: "resposta" }
});
var outputParser = new output_parsers_1.JsonOutputFunctionsParser();
var chain = functionCallingModel.pipe(outputParser);
var result = await chain.invoke('Me fale sobre os Estados Unidos');
console.log(result);
