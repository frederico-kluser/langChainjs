# LangChainTS

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![LangChain](https://img.shields.io/badge/LangChain-0.3.21-green)](https://www.langchain.com/)

Uma biblioteca TypeScript que oferece uma API unificada e consistente para interagir com diferentes provedores de modelos de linguagem (LLMs) através do LangChain.

## 🌟 Características

- 🔄 **API Unificada**: Interface simples e consistente para todos os modelos de linguagem
- 🧩 **Múltiplos Provedores**: Suporte a Claude, OpenAI, Gemini, DeepSeek e Ollama
- 📊 **Respostas Estruturadas**: Obtenha respostas em formato JSON com schemas personalizados
- 🌐 **Suporte a Idiomas**: Prompts e respostas em Português e Inglês
- 🛠️ **Altamente Configurável**: Controle tokens, temperatura e outros parâmetros
- 🔍 **TypeScript Nativo**: Tipos fortes e suporte a inferência de tipos
- 🧪 **Tratamento de Erros**: Respostas de erro consistentes e informativas

## 📋 Requisitos

- Node.js 18 ou superior
- TypeScript 5.x
- Chaves de API configuradas para os serviços que pretende utilizar

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/frederico-kluser/langchaints.git

# Navegue até o diretório
cd langchaints

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas chaves de API
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto com as chaves de API necessárias:

```
# Anthropic API Key (Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# Google API Key (Gemini)
GEMINI_API_KEY=your_gemini_api_key

# DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

## 🔍 Uso Básico

```typescript
import { getAIResponse, ModelType } from 'langchaints';

// Resposta simples com o modelo padrão (Claude)
const resposta = await getAIResponse("Qual a capital do Brasil?");
console.log(resposta); // "Brasília é a capital do Brasil..."

// Usando OpenAI
const openaiResponse = await getAIResponse(
  "Quem foi Albert Einstein?", 
  ModelType.OPENAI
);

// Com temperatura personalizada
const creativeResponse = await getAIResponse(
  "Crie uma história curta sobre um gato aventureiro",
  ModelType.CLAUDE,
  { temperature: 0.9 }
);
```

## 🌐 Suporte a Múltiplos Idiomas

```typescript
// Exemplo em português (padrão)
const resposta = await getAIResponse(
  "Qual a capital do Brasil?",
  ModelType.CLAUDE
);

// Exemplo em inglês
const response = await getAIResponse(
  "What is the capital of Brazil?",
  ModelType.CLAUDE,
  { language: 'en' }
);
```

## 📊 Respostas Estruturadas

```typescript
// Defina um schema personalizado
const customSchema = {
  nome: "nome completo da pessoa",
  idade: "idade em anos",
  profissao: "ocupação principal"
};

// T será inferido como o tipo do objeto personalizado
const resposta = await getAIResponse<{ 
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
console.log(resposta.profissao); // "engenheiro"

// Com schema personalizado em inglês
const englishSchema = {
  capital: "name of the capital city",
  country: "name of the country",
  population: "approximate population of the capital"
};

const result = await getAIResponse<{
  capital: string, 
  country: string,
  population: number
}>(
  "What is the capital of Brazil?",
  ModelType.CLAUDE,
  { 
    language: 'en',
    outputSchema: englishSchema
  }
);

console.log(result.capital); // "Brasília"
console.log(result.population); // 3094325
```

## 🧪 Exemplos de Uso

### Executando a aplicação principal
```bash
npm run start
```

### Executando testes
```bash
# Testar todos os modelos
npm run test:all

# Testar todos os modelos com resposta em formato JSON
npm run test:json
```

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular com os seguintes componentes principais:

- **LLM Service**: Serviço central que gerencia todos os provedores
- **LLM Providers**: Implementações específicas para cada modelo (Claude, OpenAI, etc.)
- **Utils**: Funções auxiliares para formatação, parsing e extração de JSON
- **Types**: Definições de tipos e interfaces comuns

```
src/
├── llm/                  # Implementações de provedores
│   ├── claude-provider.ts
│   ├── openai-provider.ts
│   ├── gemini-provider.ts
│   ├── deepseek-provider.ts
│   ├── ollama-provider.ts
│   └── factory.ts        # Factory para criar provedores
├── service/
│   └── llm-service.ts    # Serviço central
├── types.ts              # Definições de tipos
├── utils.ts              # Funções auxiliares
└── index.ts              # Ponto de entrada principal
testes/
├── resultados/           # Diretório com resultados dos testes
├── runAll.ts             # Script para testar todos os modelos
└── runAllJSON.ts         # Script para testar respostas JSON
```

## 📄 Configuração do Modelo

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

## 🔄 Modelos Suportados

A biblioteca suporta os seguintes modelos:

- **Claude (Anthropic)**: Modelos Claude atuais
- **OpenAI**: GPT-3.5 Turbo e GPT-4
- **Gemini (Google)**: Gemini 1.5 Flash
- **DeepSeek**: Modelo DeepSeek Chat
- **Ollama**: Modelos locais (llama3.1)

## 🧩 Extensão

Para adicionar um novo provedor:

1. Crie uma nova classe de provedor em `src/llm/[nome]-provider.ts`
2. Implemente a interface `ILLMProvider`
3. Adicione o provedor ao factory em `src/llm/factory.ts`
4. Adicione o provedor aos scripts de teste em `testes/runAll.ts` e `testes/runAllJSON.ts`

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, sinta-se à vontade para enviar pull requests ou abrir issues para discutir melhorias, correções de bugs ou novas funcionalidades.

## 📝 Licença

Este projeto está licenciado sob a [ISC License](LICENSE).

## 👨‍💻 Autor

**Frederico Guilherme Kluser de Oliveira**

---

Desenvolvido com ❤️ usando TypeScript e LangChain.