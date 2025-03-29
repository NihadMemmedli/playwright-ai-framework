# AI Testing Examples

This directory contains example tests that demonstrate the usage of AI capabilities in our test framework through local LLMs using Ollama.

## Prerequisites

Before running these tests, ensure you have:

1. Installed Ollama on your machine - Download from [ollama.com/download](https://ollama.com/download)
2. Started the Ollama service (`ollama serve` or launch the app)
3. Pulled at least one model (`ollama pull llama3` or `ollama pull mistral`)

## Available Examples

### 1. Simple AI Integration Test (`ai-simple-test.spec.ts`)

A quick demonstration that generates a user profile using an LLM.

```bash
npx playwright test tests/examples/ai-simple-test.spec.ts
```

### 2. Comprehensive AI Tests (`ai-example.spec.ts`)

Showcases the full range of AI capabilities in our framework:

- Test data generation with context-aware details
- Test code generation from specifications
- Test analysis and improvement suggestions
- Failure analysis

```bash
npx playwright test tests/examples/ai-example.spec.ts
```

## How It Works

The tests demonstrate:

1. **Local LLM Integration**: Connecting to Ollama running on your machine
2. **Prompt Engineering**: Crafting effective prompts for test-related tasks
3. **Response Parsing**: Processing and validating LLM outputs for test use

## Tips for Using AI in Tests

- **Model Selection**: Smaller models like Gemma 2B are faster but less capable, while larger models like Llama 3 8B provide better quality but take longer
- **Prompt Crafting**: Be specific in your prompts, providing examples of expected output when possible
- **Error Handling**: Always handle potential failures in LLM calls gracefully
- **Performance**: For CI/CD pipelines, pre-generate test data rather than generating it during test execution
- **Evaluation**: Verify AI-generated outputs before using them in critical tests

## Configuration

You can configure the AI services by modifying the default models and parameters in:

- `src/ai/LLMUtils.ts` - Model preference and utility functions
- `src/ai/LocalLLMService.ts` - Core service for LLM interaction

## Available AI Services

The framework provides several AI services to enhance your tests:

- `DataGenerator`: Generate realistic test data based on schema and context
- `TestGenerator`: Create test code from specifications
- `TestEnhancer`: Analyze and improve existing tests, suggest fixes for failures
