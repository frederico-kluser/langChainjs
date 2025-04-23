import 'dotenv/config';
import getAIResponse from '../index';
import { ModelType } from '../types';

const query = 'Me fale sobre os Estados Unidos';
const result = await getAIResponse(query, {
  model: {
    provider: ModelType.GEMINI,
    name: 'gemini-2.0-flash'
  }
});
console.log(result);