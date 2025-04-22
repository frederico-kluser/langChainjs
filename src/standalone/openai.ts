import 'dotenv/config';
import getAIResponse from '../index';
import { ModelType } from '../types';

const query = 'Me fale sobre os Estados Unidos';
const result = await getAIResponse(query, ModelType.OPENAI);
console.log(result);