"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var deepseek_1 = require("@langchain/deepseek");
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
var llm = new deepseek_1.ChatDeepSeek({
    model: "deepseek-chat", // ou "deepseek-reasoner" se preferir
    temperature: 0,
    apiKey: process.env.DEEPSEEK_API_KEY,
    // outros parâmetros se necessário
});
var res = await llm.invoke([
    ["system", "Você é um assistente útil."],
    ["human", "Me fale sobre os Estados Unidos"]
]);
console.log(res.content);
