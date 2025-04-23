import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ModelConfig } from '../types';
import { BaseLLMProvider } from './base-provider';

class GeminiProvider extends BaseLLMProvider {
  protected readonly providerName = 'Gemini';

  async createModel(config: ModelConfig) {
    return new ChatGoogleGenerativeAI({
      model: config?.model?.name || "gemini-1.5-flash",
      temperature: config?.temperature || 0,
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
}

export default GeminiProvider;