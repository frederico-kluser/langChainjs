# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Instruções para Pesquisa de Links

ATENÇÃO: Claude, você DEVE SEMPRE seguir este procedimento exato quando precisar acessar qualquer link que não esteja listado neste arquivo:

### PROCEDIMENTO OBRIGATÓRIO (NÃO PULE NENHUMA ETAPA):

1. ANTES de tentar acessar qualquer URL não listada aqui:
   - PRIMEIRO, edite este arquivo CLAUDE.md
   - ADICIONE a URL que você planeja acessar na seção "Links Úteis" abaixo
   - SOMENTE DEPOIS disso, use o WebFetchTool para acessar a URL
   - Após obter os resultados, VOLTE e REMOVA a URL temporária que você adicionou

2. Quando o usuário pedir para pesquisar um tópico genérico (sem URL específica):
   - Use o mecanismo de busca DDG (https://api.duckduckgo.com) que já está na lista
   - Construa uma URL de pesquisa com o formato: https://api.duckduckgo.com/?q=CONSULTA&format=json
   - Adicione temporariamente esta URL específica de pesquisa ao CLAUDE.md
   - Use WebFetchTool para fazer a consulta
   - Remova a URL de pesquisa específica após concluir

3. Para redirecionamentos:
   - Se encontrar erros de redirecionamento, adicione AMBAS as URLs (original e de destino)
   - Faça a pesquisa usando a URL de destino
   - Remova ambas as URLs após a pesquisa

4. Para erros 308 (Permanent Redirect) ou outros erros de redirecionamento:
   - Adicione a URL alternativa que você acredita ser o destino real
   - Por exemplo, se "example.com/api" falhar, tente adicionar "example.com/api/"

### Exemplo de uso obrigatório:

```
# Usuário pergunta: "O que é LangChain?"

1. Claude pensa: "Vou pesquisar sobre LangChain no DuckDuckGo"
2. Claude PRIMEIRO edita CLAUDE.md e adiciona:
   - https://api.duckduckgo.com/?q=what+is+langchain&format=json
3. SOMENTE ENTÃO Claude usa WebFetchTool para acessar essa URL
4. Claude processa os resultados
5. Claude REMOVE a URL temporária do CLAUDE.md
6. Claude responde ao usuário com as informações obtidas
```

Este procedimento é absolutamente necessário devido a restrições de segurança e NÃO DEVE SER IGNORADO sob nenhuma circunstância. Qualquer tentativa de acessar URLs não listadas sem seguir este procedimento resultará em erros.

## Links Úteis
- [LangChain JS](https://js.langchain.com/docs/get_started/introduction)
- [LangSmith](https://smith.langchain.com)
- [LangSmith Docs](https://docs.langchain.com/docs/langsmith)
- [LangChain JS GitHub](https://github.com/langchain-ai/langchainjs)
- [LangGraph JS](https://js.langchain.com/docs/langgraph)
- [LangGraph JS GitHub](https://github.com/langchain-ai/langgraphjs)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Google Gemini API](https://ai.google.dev/docs)
- [DeepSeek API](https://platform.deepseek.com)
- [Ollama](https://ollama.com/docs)
- [DuckDuckGo API](https://api.duckduckgo.com)
- [MDN Web Docs](https://developer.mozilla.org)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Node.js Docs](https://nodejs.org/en/docs)
- [npm Docs](https://docs.npmjs.com)
- [GitHub Docs](https://docs.github.com)
- [Wikipedia](https://en.wikipedia.org)
- [Stack Overflow](https://stackoverflow.com)
- [DevDocs API Documentation](https://devdocs.io)
- [Can I Use](https://caniuse.com)

## Comandos de Build
- Executar aplicação: `npm run start`
- Executar testes de modelos: `npm run test:all` (todos os modelos), `npm run test:json` (teste com respostas JSON)
- Executar testes unitários: `npm run test:unit`
- Executar testes de integração: `npm run test:integration`
- Executar todos os testes: `npm run test`
- Executar com cobertura: `npm run test:coverage`

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
- Claude (Anthropic)
- OpenAI
- Gemini (Google)
- DeepSeek
- Ollama (modelos locais)

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