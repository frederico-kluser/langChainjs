import 'dotenv/config';
import getAIResponse from '../index';
import { ModelType } from '../types';

const query = 'Me fale sobre os Estados Unidos';
const result = await getAIResponse(query, {
  model: {
    provider: ModelType.OLLAMA,
    name: 'rolandroland/llama3.1-uncensored:latest'
  }
});
console.log(result);