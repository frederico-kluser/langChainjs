# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Comandos de Build
- Executar aplicação: `npm run start`
- Executar modelos específicos: `npm run claude`, `npm run openai`, `npm run ollama`, `npm run deepseek`, `npm run gemini`
- Comando de atalho: `npm run ai` (alias para claude)

## Diretrizes de Estilo de Código
- **Formatação**: Indentação de 2 espaços, ponto e vírgula, aspas duplas para strings, aspas simples para importações
- **Importações**: Ordem como ambiente, bibliotecas de terceiros e depois módulos locais
- **Tipos**: Usar modo estrito do TypeScript, interfaces para definições de tipo, Zod para validação de schema
- **Nomenclatura**: camelCase para variáveis/funções, PascalCase para tipos/interfaces
- **Tratamento de Erros**: Blocos try/catch para chamadas de API, mensagens de erro específicas
- **Arquitetura**: Abordagem modular com arquivos separados para cada provedor de LLM
- **Formato de Resposta**: Retornar diretamente o valor correspondente ao tipo genérico T
- **Serviço Central**: LLM Service para gestão centralizada de todos os provedores
- **Processamento de Resposta**: Cada provedor deve retornar a resposta diretamente, sem encapsular em um objeto adicional
- **Output Schemas**: Suporte para schemas personalizados para respostas estruturadas
- **Internacionalização**: Suporte para múltiplos idiomas nos prompts e respostas (português e inglês)

## Modelos Suportados
- Claude (Anthropic): `npm run claude`
- OpenAI: `npm run openai`
- Gemini (Google): `npm run gemini`
- DeepSeek: `npm run deepseek`
- Ollama (modelos locais): `npm run ollama`

## Configuração de Modelos
```typescript
export interface ModelConfig {
  maxTokens?: number;     // Limite de tokens na resposta
  temperature?: number;   // Controle de criatividade (0.0-1.0)
  outputSchema?: Record<string, any>; // Schema para respostas estruturadas
  language?: string;      // Idioma para prompts e respostas ('pt' ou 'en')
}

// Tipo de resposta
export type LLMResponse<T = string> = T;
```

## Implementação de Schema Personalizado
```typescript
// Exemplo de uso com schema personalizado
const customSchema = {
  nome: "nome completo da pessoa",
  idade: "idade em anos",
  profissao: "ocupação principal"
};

// T será inferido como o tipo do objeto personalizado
const resposta = await llmService.getResponse<{ 
  nome: string, 
  idade: number, 
  profissao: string 
}>(
  "Dados de João Silva, 32 anos, engenheiro",
  ModelType.CLAUDE,
  { outputSchema: customSchema }
);

// Acesso direto às propriedades
console.log(resposta.nome); // "João Silva"
console.log(resposta.idade); // 32
```

## Suporte a Múltiplos Idiomas
```typescript
// Exemplo em português (padrão)
const resposta = await llmService.getResponse(
  "Qual a capital do Brasil?",
  ModelType.CLAUDE
);

// Exemplo em inglês
const response = await llmService.getResponse(
  "What is the capital of Brazil?",
  ModelType.CLAUDE,
  { language: 'en' }
);

// Com schema personalizado em inglês
const customSchema = {
  capital: "name of the capital city",
  country: "name of the country"
};

const result = await llmService.getResponse<{capital: string, country: string}>(
  "What is the capital of Brazil?",
  ModelType.CLAUDE,
  { 
    language: 'en',
    outputSchema: customSchema
  }
);
```

## Comandos de Verificação
- Verificação de tipos: `npx tsc --noEmit`