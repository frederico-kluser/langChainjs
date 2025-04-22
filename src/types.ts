export interface LLMResponse<T = string> {
  resposta: T;
}

export interface ModelConfig {
  maxTokens?: number;
  temperature?: number;
  outputSchema?: Record<string, any>;
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
  getResponse<T = string>(query: string, config?: ModelConfig): Promise<LLMResponse<T>>;
}

export interface IResponseFormatter {
  formatResponse<T = string>(rawResponse: any, outputSchema?: Record<string, any>): Promise<LLMResponse<T>>;
}