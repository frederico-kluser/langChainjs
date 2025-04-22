export type LLMResponse<T = string> = T;

export interface ModelConfig {
	maxTokens?: number;
	temperature?: number;
	outputSchema?: Record<string, any>;
	language?: 'pt' | 'en';
}

export enum ModelType {
	CLAUDE = 'claude',
	OPENAI = 'openai',
	GEMINI = 'gemini',
	DEEPSEEK = 'deepseek',
	OLLAMA = 'ollama',
}

export interface ILLMProvider {
	createModel(config?: ModelConfig): Promise<any>;
	getResponse<T = string>(query: string, config?: ModelConfig): Promise<LLMResponse<T>>;
}

export interface IResponseFormatter {
	formatResponse<T = string>(rawResponse: any, outputSchema?: Record<string, any>): Promise<LLMResponse<T>>;
}
