import 'dotenv/config';
import { getStructuredResponse } from '../gemini';

const query = 'Me fale sobre os Estados Unidos';
const result = await getStructuredResponse(query);
console.log(result);