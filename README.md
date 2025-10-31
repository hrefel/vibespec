# VibeSpec CLI

A CLI tool for transforming raw requirements into structured specs using hybrid parsing (AI + heuristic).

## Features

- **Hybrid Processing**: Combines heuristic parsing with AI refinement for optimal accuracy and speed
- **Interactive Wizard Mode**: Guided interactive refinement when AI is unavailable
- **Multiple AI Providers**: Supports OpenAI, Anthropic Claude, OpenRouter, and GLM (ZhipuAI)
- **Intelligent Caching**: LRU cache minimizes redundant API calls
- **Flexible Configuration**: Environment variables, `.env` files, and config files
- **Validation**: Built-in spec validation against schema
- **Multiple Formats**: Output to JSON, YAML, or TOON (Token-Oriented Object Notation)

## Quick Start

### 1. Set up API Key

Create a `.env` file:

```bash
cp .env.example .env
```

Add your API key:

```env
# Choose one provider:
OPENAI_API_KEY=your-api-key-here
# or
ANTHROPIC_API_KEY=your-api-key-here
# or
OPENROUTER_API_KEY=your-api-key-here
# or
ZAI_API_KEY=your-glm-api-key-here
```

### 2. Parse a Requirement

```bash
vibespec parse "User wants a dashboard that shows real-time sales and traffic data"
```

Or from a file:

```bash
vibespec parse requirements.txt --output my-spec.json
```

## Commands

### `parse` - Convert raw text to structured spec

```bash
vibespec parse <input> [options]
```

**Arguments:**
- `<input>` - Input file path or raw text

**Options:**
- `--output <file>` - Output file path (default: auto-generated)
- `--format <json|yaml|toon>` - Output format (default: json)
- `--provider <openai|claude|openrouter|glm>` - AI provider (default: from config)
- `--token <apiKey>` - API key override
- `--interactive` - Enable interactive mode
- `--no-cache` - Disable caching

**Examples:**

```bash
# Basic usage
vibespec parse "Build a todo app with CRUD operations"

# From file with custom output
vibespec parse requirements.txt --output spec.json

# Use Claude instead of OpenAI
vibespec parse input.txt --provider claude

# Use OpenRouter (free tier available)
vibespec parse input.txt --provider openrouter

# Use GLM (ZhipuAI)
vibespec parse input.txt --provider glm

# YAML output format
vibespec parse input.txt --format yaml

# TOON output format (optimized for LLM token efficiency)
vibespec parse input.txt --format toon

# Interactive wizard mode
vibespec parse input.txt --interactive

# Disable cache
vibespec parse input.txt --no-cache
```

### `validate` - Validate a spec file

```bash
vibespec validate <spec-file>
```

**Examples:**

```bash
vibespec validate my-spec.json
vibespec validate output.yaml
vibespec validate output.toon
```

### `config` - Manage configuration

```bash
vibespec config [action] [key] [value]
```

**Actions:**
- `list` - Show all configuration (default)
- `get <key>` - Get specific config value
- `set <key> <value>` - Set config value

**Available Keys:**
- `provider` - AI provider (openai, claude, openrouter, glm)
- `model` - Model name (e.g., gpt-4o-mini, meta-llama/llama-3.1-8b-instruct:free)
- `useCache` - Enable/disable cache (true, false)
- `outputPath` - Default output directory
- `defaultFormat` - Default format (json, yaml, toon)

**Examples:**

```bash
# Show all config
vibespec config list

# Get specific value
vibespec config get provider

# Set provider to Claude
vibespec config set provider claude

# Set provider to OpenRouter
vibespec config set provider openrouter

# Enable cache
vibespec config set useCache true

# Set output path
vibespec config set outputPath ./my-specs
```

### `cache` - Manage in-memory cache

```bash
vibespec cache [action]
```

**Actions:**
- `status` - Show cache statistics (default)
- `clear` - Clear all cached entries

**Examples:**

```bash
# View cache status
vibespec cache status

# Clear cache
vibespec cache clear
```

## Interactive Wizard Mode

When AI is unavailable or you want more control over spec generation, use the `--interactive` flag to launch the wizard:

```bash
vibespec parse requirements.txt --interactive
```

The wizard guides you through:

1. **Title Refinement** - Confirm or edit the project title
2. **Domain Selection** - Choose from 8 available domains
3. **Description** - Refine the project description
4. **Requirements** - Review and edit detected requirements
5. **Tech Stack** - Specify technologies (comma-separated)
6. **Components** - Define key components
7. **Acceptance Criteria** - Add success criteria
8. **AI Guidance** - Include implementation hints and best practices

This interactive approach is particularly useful when:
- You don't have an AI API key
- You want fine-grained control over the spec
- The heuristic parser needs human guidance
- You're working on complex requirements that need clarification

## TOON Format (Token-Oriented Object Notation)

VibeSpec supports TOON, a compact data format optimized for minimizing token consumption when passing structured data to Large Language Models.

### Why Use TOON?

- **Token Efficiency**: Achieves 20-60% token reduction compared to JSON
- **LLM-Optimized**: Designed specifically for AI consumption, not human readability
- **Cost Savings**: Reduce token costs when feeding specs to AI coding assistants or LLM-based workflows
- **Maintains Accuracy**: Benchmarks show competitive or better retrieval accuracy vs JSON

### When to Use TOON

TOON is ideal when:
- Generated specs will be consumed by LLMs or AI tools
- You're working with token-limited contexts
- Token costs are a concern
- Specs have uniform arrays (requirements, acceptance criteria, tech stack)

Use JSON or YAML when:
- Human readability is priority
- Specs are for documentation purposes
- Integration with tools that don't support TOON

### Usage Examples

```bash
# Generate spec in TOON format
vibespec parse requirements.txt --format toon

# Set TOON as default format
vibespec config set defaultFormat toon

# Validate TOON files
vibespec validate spec.toon
```

### Token Savings Example

For a typical requirement spec:
- **JSON**: ~408 tokens (1,633 bytes)
- **TOON**: ~361 tokens (1,444 bytes)
- **Savings**: 20% fewer tokens

Savings increase with larger specs containing more uniform arrays.

### About TOON

TOON combines YAML's indentation-based nesting with CSV's tabular efficiency. It eliminates redundant syntax (braces, brackets, repeated field names) while maintaining full data fidelity.

Learn more: [TOON GitHub Repository](https://github.com/johannschopplich/toon)

## GLM (ZhipuAI) Integration

VibeSpec fully supports GLM (ZhipuAI), a powerful Chinese AI model platform offering competitive performance and pricing.

### Why Use GLM?

- **High Performance**: GLM-4 models offer strong reasoning capabilities
- **Multilingual Support**: Excellent Chinese language understanding
- **Cost Effective**: Competitive pricing for API usage
- **Multiple Models**: Access to GLM-4, GLM-4-Flash, and other variants

### Getting Started with GLM

1. Sign up at [ZhipuAI Open Platform](https://open.bigmodel.cn/)
2. Get your API key from the dashboard
3. Set your environment variable:

```bash
export ZAI_API_KEY=your-glm-api-key
```

4. Use with VibeSpec:

```bash
# Use default GLM model
vibespec parse requirements.txt --provider glm

# Use specific model
vibespec config set provider glm
vibespec config set model "glm-4-flash"  # Fast, efficient model
# or
vibespec config set model "glm-4.0"  # More capable model
```

### Available GLM Models

Popular models on ZhipuAI platform:
- `glm-4-flash` - Fast, cost-effective model (recommended for most use cases)
- `glm-4.0` - More capable model for complex requirements
- `glm-4-air` - Balanced performance and cost
- `glm-4-plus` - Enhanced capabilities

For more models and pricing, visit [ZhipuAI documentation](https://open.bigmodel.cn/dev/api)

## OpenRouter Integration

OpenRouter provides unified access to multiple AI models through a single API. It's particularly useful for:

- **Free Tier Access**: Several models available at no cost (e.g., `meta-llama/llama-3.1-8b-instruct:free`)
- **Model Flexibility**: Switch between models without changing your code
- **Open Source Models**: Access to various open-source LLMs
- **Cost Optimization**: Compare pricing across different models

### Getting Started with OpenRouter

1. Sign up at [openrouter.ai](https://openrouter.ai/)
2. Get your API key from the dashboard
3. Set your environment variable:

```bash
export OPENROUTER_API_KEY=your-openrouter-key
```

4. Use with VibeSpec:

```bash
# Use default free model
vibespec parse requirements.txt --provider openrouter

# Use specific model
vibespec config set provider openrouter
vibespec config set model "meta-llama/llama-3.1-8b-instruct:free"
```

### Available Models

Popular free and open-source models on OpenRouter:
- `meta-llama/llama-3.1-8b-instruct:free` - Fast, free Llama model (default)
- `google/gemma-2-9b-it:free` - Google's Gemma model
- `mistralai/mistral-7b-instruct:free` - Mistral's efficient model
- `microsoft/phi-3-mini-128k-instruct:free` - Compact Microsoft model

For more models, visit [openrouter.ai/models](https://openrouter.ai/models)

## Configuration

### Priority Order

API keys are resolved in this order:

1. CLI flag (`--token`)
2. Global environment variable (`OPENAI_API_KEY`, etc.)
3. `.env` file
4. `vibes.config.json`

### Config File

Create `vibes.config.json` in your project:

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "useCache": true,
  "outputPath": "./specs",
  "defaultFormat": "json"
}
```

### Environment Variables

Supported variables:

- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `OPENROUTER_API_KEY` - OpenRouter API key
- `ZAI_API_KEY` - ZhipuAI (GLM) API key
- `VIBES_AI_KEY` - Generic fallback key

## Output Spec Schema

Generated specs follow this structure:

```json
{
  "title": "Real-Time Sales Dashboard",
  "domain": "frontend",
  "description": "A dashboard for monitoring sales and traffic in real-time.",
  "requirements": [
    "Display real-time sales metrics",
    "Show current traffic data",
    "Update data automatically"
  ],
  "components": ["Chart", "Dashboard Layout", "WebSocket Service"],
  "tech_stack": ["React", "WebSocket", "Chart.js"],
  "acceptance_criteria": [
    "Data updates every 5 seconds",
    "Responsive across all devices"
  ],
  "ai_guidance": "Focus on efficient WebSocket handling and chart rendering performance.",
  "metadata": {
    "spec_version": "1.0.0",
    "generated_by": "vibes-cli v5.0.0",
    "generated_at": "2025-10-28T12:00:00Z",
    "input_hash": "sha256...",
    "processing": {
      "provider": "openai",
      "model": "gpt-4o-mini",
      "heuristic_confidence": 0.75,
      "ai_refinement_applied": true,
      "cache_hit": false
    }
  }
}
```

## Valid Domains

- `frontend` - UI, components, dashboards
- `backend` - APIs, services, databases
- `fullstack` - End-to-end features
- `mobile` - iOS, Android, React Native
- `infrastructure` - DevOps, cloud, deployment
- `testing` - QA, test suites
- `devops` - CI/CD, automation
- `data` - Analytics, ETL, data pipelines

## Troubleshooting

### "No API key found"

Make sure you've set an API key via one of these methods:
- CLI flag: `--token YOUR_KEY`
- Environment variable: `export OPENAI_API_KEY=YOUR_KEY`
- `.env` file: `OPENAI_API_KEY=YOUR_KEY`

### "Input too short"

Minimum 20 characters required. Provide more context in your requirement.

### "AI refinement failed"

The CLI will automatically fall back to heuristic-only parsing. Check:
- API key is valid
- Network connection is working
- Provider is not rate-limited

### Using GLM (ZhipuAI)

GLM is fully supported. Use it with:
```bash
export ZAI_API_KEY=your-glm-api-key
vibespec config set provider glm
vibespec config set model "glm-4-flash"  # or glm-4.0
vibespec parse requirements.txt
```

### Want to use free AI models?

Use OpenRouter with free tier models:
```bash
vibespec config set provider openrouter
vibespec config set model "meta-llama/llama-3.1-8b-instruct:free"
```

## License

MIT

## Version

5.0.0
