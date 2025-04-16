import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI();
const result = await llm.invoke('Hello, world!');
console.log(result);