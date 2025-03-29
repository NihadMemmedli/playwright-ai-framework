# Advanced Test Automation Framework

A scalable test automation framework for UI and API testing, built with TypeScript, Playwright, and Axios.

## Features

- **UI Testing**: Using Playwright for cross-browser testing
- **API Testing**: Using Axios for HTTP requests
- **Reporting**: Allure reports for test results visualization
- **Design Patterns**:
  - Page Object Model (POM) for UI testing
  - Repository Pattern for API testing
  - Builder Pattern for test data creation
  - Factory Pattern for data generation
- **Structure**:
  - Clear separation of concerns
  - Modular architecture
  - Highly maintainable and scalable
- **Real-World Examples**:
  - GitHub UI testing
  - JSONPlaceholder API testing
  - Integration of UI and API tests

## Getting Started

Follow these steps to set up the project locally:

1.  **Clone the Repository:**
    ```bash
    # Replace <repository-url> with the actual GitHub repository URL once available
    git clone https://github.com/NihadMemmedli/playwright-ai-framework.git
    # Navigate into the project directory
    cd project1
    ```

2.  **Install Dependencies:**
    This project uses Node.js and npm. Ensure you have a recent version installed.
    ```bash
    npm install
    ```

3.  **Install Playwright Browsers:**
    Playwright requires browser binaries to execute tests.
    ```bash
    npx playwright install
    ```

4.  **Set Up Environment Variables:**
    The framework uses a `.env` file for configuration.
    ```bash
    # Create your local environment file from the example
    cp .env.example .env
    ```
    Next, open the newly created `.env` file and customize the variables (like API endpoints, test credentials, etc.) according to your specific testing environment. Refer to the [Configuration](#configuration) section below for details on each variable.

## Configuration

The framework uses environment variables for configuration. Copy `.env.example` to `.env` and modify as needed:

```bash
# API configuration
API_BASE_URL=https://jsonplaceholder.typicode.com
API_TIMEOUT=30000
API_KEY=your_optional_api_key

# UI configuration
BASE_URL=https://github.com
HEADLESS=true
DEFAULT_TIMEOUT=30000
SLOWMO=0

# Test configuration
TEST_ENV=dev
TEST_USER=test@example.com
TEST_PASSWORD=Password123
RETRY_COUNT=2

# Reporting
ALLURE_RESULTS_DIR=allure-results

### AI Service Configuration

This framework supports using either a local LLM (via Ollama) or a cloud-based LLM (currently Google Gemini via AI Studio) for AI-assisted features like test generation, enhancement, and visual analysis.

-   **`AI_SERVICE_MODE`**: Determines which service to use.
    -   `local` (Default): Uses the locally running Ollama service. Requires Ollama setup (see below).
    -   `google`: Uses the Google Gemini API via Google AI Studio. Requires a `GOOGLE_API_KEY`.
-   **`GOOGLE_API_KEY`**: Your API key from Google AI Studio (required if `AI_SERVICE_MODE=google`). Get one [here](https://aistudio.google.com/app/apikey).
-   **`GOOGLE_GEMINI_MODEL`**: The specific Gemini model to use (e.g., `gemini-pro`, `gemini-1.5-flash`). Defaults to `gemini-pro`. Ensure the chosen model supports the required capabilities (e.g., vision for multimodal tasks).

### Local LLM (Ollama) Configuration

These settings are used only if `AI_SERVICE_MODE=local`.

-   **`OLLAMA_BASE_URL`**: The base URL for your running Ollama API endpoint (defaults to `http://localhost:11434/api`).
-   **`OLLAMA_DEFAULT_MODEL`**: The default Ollama model for general text generation tasks (e.g., `llama3:latest`).
-   **`OLLAMA_VISUAL_MODEL`**: The Ollama model used specifically for visual analysis tasks (e.g., `llava:latest`). Ensure this model is pulled and available in Ollama.

```

## Hardware Requirements (for Local AI Features)

This project includes advanced features utilizing local Large Language Models (LLMs) via components like `src/ai/LocalLLMService.ts`. Running these AI-powered tests effectively requires significant hardware resources:

-   **RAM:** Minimum 16GB recommended; 32GB+ ideal for larger models.
-   **CPU:** Modern multi-core processor.
-   **GPU (Highly Recommended):** A dedicated NVIDIA GPU with substantial VRAM (e.g., 8GB+) is strongly advised for acceptable performance. LLM tasks are compute-heavy and benefit greatly from GPU acceleration.
-   **Disk Space:** Sufficient free space (potentially 10s of GBs) for downloading and storing LLM models.

*Note: If your system doesn't meet these specs, or you don't plan to use the local AI features, you can still run the standard UI and API tests without issue.*

## Project Structure

```
├── src/
│   ├── api/               # API testing components
│   │   ├── ApiClient.ts   # Base API client
│   │   └── *Repository.ts # API repositories
│   ├── config/            # Configuration
│   │   └── config.ts      # Environment configuration
│   ├── core/              # Core framework components
│   ├── fixtures/          # Test data fixtures
│   ├── models/            # Data models
│   ├── ui/                # UI testing components
│   │   ├── BasePage.ts    # Base Page Object
│   │   └── pages/         # Page Objects
│   └── utils/             # Utilities
│       └── DataGenerator.ts # Test data generator
├── tests/
│   ├── api/               # API tests
│   ├── ui/                # UI tests
│   └── integration/       # Integration tests
├── playwright.config.ts   # Playwright configuration
└── tsconfig.json          # TypeScript configuration
```

## Real-World Examples

This framework includes practical examples using real websites:

- **GitHub UI Testing**: Tests for GitHub's user interface, including login, navigation, search, and repository browsing
- **JSONPlaceholder API Testing**: Tests for JSONPlaceholder's RESTful API for user management
- **Integration Testing**: Examples of how API and UI tests can be integrated together

## Running Tests

Execute tests using npm scripts or directly with Playwright CLI:

1.  **Run All Tests:**
    Executes all test suites as configured in `playwright.config.ts` (might run across multiple browsers/workers).
    ```bash
    npm test
    ```

2.  **Run with Playwright UI Mode:**
    Opens the interactive Playwright UI for debugging and exploring tests.
    ```bash
    npm run test:ui
    ```

3.  **Run Specific Test Suites (Recommended: Chromium):**
    Target UI, API, or integration tests specifically. Using a single browser like Chromium is often faster for local runs.
    ```bash
    # Run only UI tests using the 'chromium' project config
    npm run test:chrome:ui

    # Run only API tests using the 'chromium' project config
    npm run test:chrome:api

    # Run only Integration tests using the 'chromium' project config
    npm run test:chrome:integration
    ```

4.  **Run Individual Files or Filter Tests:**
    Use the `npx playwright test` command for more granular control.
    ```bash
    # Run a specific test file (ensure the project config matches your needs)
    npx playwright test tests/ui/todo.spec.ts --project=chromium

    # Run tests whose titles match a specific pattern (grep)
    npx playwright test -g "user login" --project=chromium
    ```

*Tip: Explore other scripts in `package.json` for more specific scenarios or use `npx playwright test --help` to see all available Playwright CLI options.*

## Reporting

```bash
# Generate and open Allure report
npm run report

# Show Playwright HTML report
npm run show-report

# Clean all reports
npm run clean
```

## Design Patterns

### Page Object Model (POM)

The framework uses the Page Object Model pattern for UI testing, where each web page is represented by a class that encapsulates the page's functionality and elements.

Example:

```typescript
// LoginPage.ts for GitHub
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
```

### Repository Pattern

The Repository pattern is used for API testing, providing a clean separation between data access logic and business logic.

Example:

```typescript
// UserRepository.ts for JSONPlaceholder
export class UserRepository {
  async getAllUsers(): Promise<User[]> {
    const response = await this.apiClient.get<any[]>("/users");
    return response.data.map((userData) => User.fromJson(userData));
  }
}
```

### Builder Pattern

The Builder pattern is used for creating complex objects with many parameters.

Example:

```typescript
// Creating a User with Builder pattern
const user = User.builder()
  .withName("John Doe")
  .withEmail("john@example.com")
  .withPhone("123-456-7890")
  .build();
```

## Scaling to 10,000+ Tests

The framework is designed to scale to a large number of tests through:

1. **Parallelization**: Tests run in parallel to reduce execution time
2. **Clear Structure**: Organized project structure for easy maintenance
3. **Reusable Components**: Common functionality is abstracted into reusable components
4. **Efficient Resource Usage**: Resources are carefully managed
5. **CI/CD Integration**: Ready for continuous integration

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.
