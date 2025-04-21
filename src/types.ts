export interface LLMResponse {
  resposta: string;
}

export interface ModelConfig {
  maxTokens?: number;
  temperature?: number;
}
