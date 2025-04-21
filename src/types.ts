export interface LLMResponse {
  resposta: string;
}

export interface ModelConfig {
  maxTokens?: number;
  temperature?: number;
}

export enum ModelType {
  CLAUDE = "claude",
  OPENAI = "openai",
  GEMINI = "gemini",
  DEEPSEEK = "deepseek",
  OLLAMA = "ollama"
}

export interface ILLMProvider {
  createModel(config?: ModelConfig): Promise<any>;
  getResponse(query: string, config?: ModelConfig): Promise<LLMResponse>;
}

export interface IResponseFormatter {
  formatResponse(rawResponse: any): Promise<LLMResponse>;
}