# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Run app: `npm run start`
- Run specific models: `npm run claude`, `npm run openai`, `npm run ollama`, `npm run deepseek`, `npm run gemini`
- Shortcut command: `npm run ai` (alias for claude)

## Code Style Guidelines
- **Formatting**: 2-space indentation, semicolons, double quotes for strings, single quotes for imports
- **Imports**: Order as environment, third-party libs, then local modules
- **Types**: Use TypeScript strict mode, interfaces for type definitions, Zod for schema validation
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces
- **Error Handling**: Try/catch blocks for API calls, specific error messages
- **Architecture**: Modular approach with separate files for each LLM provider
- **Response Format**: Consistent JSON schema structure for all LLM responses

Run typecheck: `npx tsc --noEmit`