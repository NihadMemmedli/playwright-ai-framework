# AI Module

This module provides AI-powered capabilities for the test framework using local Large Language Models via Ollama.

## Features

- 🤖 **Local LLM Integration**: Connect to locally running LLMs through Ollama
- 🧪 **Test Generation**: Generate test cases from specifications
- 📊 **Test Data Generation**: Create realistic test data
- 🔍 **Test Analysis**: Analyze and improve existing tests
- 🐛 **Failure Analysis**: Diagnose test failures and suggest fixes

## Prerequisites

Before using this module, you need to have Ollama installed:

```bash
# Install Ollama on macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# For Windows, download from https://ollama.com/download
```

## Available Models

The module works best with these models:

- `llama3:8b-q4_0` - Recommended for M3 Mac (18GB RAM)
- `gemma:2b-q4_0` - Lighter alternative for constrained systems
- `mistral:7b-q4_0` - Good reasoning capabilities
- `phi3:mini-4k-instruct-q4_0` - Fast responses for simple tasks

## Getting Started

1. **Install Ollama** using the instructions above
2. **Pull the recommended model**:
   ```bash
   ollama pull llama3:8b-q4_0
   ```
3. **Start Ollama**:
   ```bash
   ollama serve
   ```

## Usage Examples

### Test Generation

```typescript
import { TestGenerator } from "../ai/TestGenerator";

// Create a test generator
const generator = new TestGenerator();

// Generate a test case from a specification
const specification = `
Feature: Todo List Management
- User should be able to add new todos
- User should be able to mark todos as completed
- User should be able to filter todos by status
`;

const testCode = await generator.generateTestFromSpec(specification);
console.log(testCode);
```

### Test Data Generation

```typescript
import { DataGenerator } from "../ai/DataGenerator";

// Create a data generator
const dataGenerator = new DataGenerator();

// Generate todo items
const todos = await dataGenerator.generateTodoItems(3, "Work-related tasks");
console.log(todos);

// Generate a user profile
const user = await dataGenerator.generateUserProfile("Software developer");
console.log(user);
```

### Test Enhancement

```typescript
import { TestEnhancer } from "../ai/TestEnhancer";
import * as fs from "fs";

// Create a test enhancer
const enhancer = new TestEnhancer();

// Analyze a test failure
const error = new Error("Element not found: .submit-button");
const testCode = fs.readFileSync("tests/ui/login.spec.ts", "utf-8");
const analysis = await enhancer.analyzeFailure(error, testCode);
console.log(analysis.likelyRootCause);
console.log(analysis.suggestedFixes);

// Improve a test
const improvements = await enhancer.improveTest(testCode);
console.log(improvements.refactoringSuggestions);
```

## Classes and Interfaces

- **LocalLLMService**: Core service for interacting with Ollama
- **LLMUtils**: Utilities for managing Ollama and models
- **TestGenerator**: Generate test cases from specifications
- **DataGenerator**: Generate realistic test data
- **TestEnhancer**: Analyze and improve existing tests

## Extending

To extend the AI capabilities:

1. Add new domain-specific generation methods to existing classes
2. Create new specialized AI service classes
3. Customize prompts for specific testing patterns or domains
