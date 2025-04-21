import 'dotenv/config';
import { getStructuredResponse } from '../openai';

const query = 'Me fale sobre os Estados Unidos';
const result = await getStructuredResponse(query);
console.log(result);