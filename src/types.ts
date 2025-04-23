export type LLMResponse<T = string> = T;

export enum ModelType {
	CLAUDE = 'claude',
	OPENAI = 'openai',
	GEMINI = 'gemini',
	DEEPSEEK = 'deepseek',
	OLLAMA = 'ollama',
}

export type Models =
	| {
			provider: ModelType.CLAUDE;
			name: 'claude-3-7-sonnet-latest' | 'claude-3-5-haiku-latest';
	  }
	| {
			provider: ModelType.OPENAI;
			name: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4.1' | 'gpt-4.1-mini' | 'gpt-4.1-nano';
	  }
	| {
			provider: ModelType.GEMINI;
			name: 'gemini-2.5-flash-preview-04-17' | 'gemini-2.5-pro-preview-03-25' | 'gemini-2.0-flash';
	  }
	| {
			provider: ModelType.DEEPSEEK;
			name: 'deepseek-chat' | 'deepseek-reasoner';
	  }
	| {
			provider: ModelType.OLLAMA;
			name: 'deepseek-r1:8b' | 'rolandroland/llama3.1-uncensored:latest';
	  };

export interface ModelConfig {
	maxTokens?: number;
	temperature?: number;
	outputSchema?: Record<string, any>;
	language?: 'pt' | 'en';
	model: Models;
}

export interface ILLMProvider {
	createModel(config: ModelConfig): Promise<any>;
	getResponse<T = string>(query: string, config: ModelConfig): Promise<LLMResponse<T>>;
}

export interface IResponseFormatter {
	formatResponse<T = string>(rawResponse: any, outputSchema?: Record<string, any>): Promise<LLMResponse<T>>;
}
