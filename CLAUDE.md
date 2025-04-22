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
- **Formato de Resposta**: Estrutura de schema JSON consistente para todas as respostas LLM
- **Serviço Central**: LLM Service para gestão centralizada de todos os provedores

Executar verificação de tipos: `npx tsc --noEmit`