import 'dotenv/config';
import getAIResponse from '../index';
import { ModelType } from '../types';

const query = 'Me fale sobre os Estados Unidos';
const result = await getAIResponse(query, {
  model: {
    provider: ModelType.CLAUDE,
    name: 'claude-3-7-sonnet-latest'
  }
});
console.log(result);