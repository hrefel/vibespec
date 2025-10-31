# Getting Started with VibeSpec CLI

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional - makes 'vibespec' command available)
npm link
```

## Quick Start Guide

### 1. Check CLI Version

```bash
node dist/index.js --version
# or if linked globally:
vibespec --version
```

### 2. View Help

```bash
node dist/index.js --help
# or if linked globally:
vibespec --help
```

### 3. Parse Your First Requirement

**Without AI (Heuristic Only):**

```bash
vibespec parse "Build a todo app with add, edit, and delete functionality using React"
```

**With AI (Requires API Key):**

First, set up your API key:

```bash
# Option 1: Environment variable (OpenAI)
export OPENAI_API_KEY=your-api-key-here

# Option 2: OpenRouter (free tier available)
export OPENROUTER_API_KEY=your-openrouter-key-here

# Option 3: GLM (ZhipuAI)
export ZAI_API_KEY=your-glm-api-key-here

# Option 4: Create .env file
echo "OPENAI_API_KEY=your-api-key-here" > .env
# or
echo "OPENROUTER_API_KEY=your-openrouter-key-here" > .env
# or
echo "ZAI_API_KEY=your-glm-api-key-here" > .env

# Then run parse
vibespec parse "Build a todo app with add, edit, and delete functionality using React"
# or with OpenRouter
vibespec parse "Build a todo app with add, edit, and delete functionality using React" --provider openrouter
# or with GLM
vibespec parse "Build a todo app with add, edit, and delete functionality using React" --provider glm
```

**From a file:**

```bash
# Create a requirements file
echo "Build a real-time chat application with user authentication, message history, and emoji support. Use React for frontend and Node.js with Socket.io for backend." > my-requirement.txt

# Parse it
vibespec parse my-requirement.txt --output my-spec.json
```

**Using Interactive Wizard:**

```bash
# Launch wizard for guided spec creation
vibespec parse my-requirement.txt --interactive
```

### 4. Validate a Spec

```bash
vibespec validate my-spec.json
```

### 5. Configure the CLI

```bash
# View current configuration
vibespec config list

# Change AI provider to Claude
vibespec config set provider claude

# Set your preferred output path
vibespec config set outputPath ./my-specs

# Enable/disable caching
vibespec config set useCache true
```

### 6. Manage Cache

```bash
# Check cache status
vibespec cache status

# Clear cache
vibespec cache clear
```

## Common Workflows

### Workflow 1: Quick Spec Generation

```bash
# Generate spec from text (JSON)
vibespec parse "User wants dashboard with sales data"

# Generate in YAML format
vibespec parse "User wants dashboard with sales data" --format yaml

# Generate in TOON format (optimized for LLM token efficiency)
vibespec parse "User wants dashboard with sales data" --format toon

# Spec is saved to ./specs/requirement-[timestamp].spec.[format]
```

### Workflow 2: AI-Powered Parsing

```bash
# Set up API key (one time)
export OPENAI_API_KEY=sk-...

# Parse with AI refinement
vibespec parse requirements.txt --provider openai --output refined-spec.json

# Validate the output
vibespec validate refined-spec.json
```

### Workflow 3: Interactive Wizard Mode

```bash
# Use wizard for detailed spec creation without AI
vibespec parse requirements.txt --interactive

# Wizard guides you through:
# - Title, domain, and description
# - Requirements and components
# - Tech stack and acceptance criteria
# - Implementation guidance
```

### Workflow 4: Using Free OpenRouter Models

```bash
# Set up OpenRouter with free tier model
export OPENROUTER_API_KEY=your-key-here

# Configure to use OpenRouter by default
vibespec config set provider openrouter
vibespec config set model "meta-llama/llama-3.1-8b-instruct:free"

# Parse requirements using free models
vibespec parse requirements.txt --output spec.json

# No API costs for free tier models!
```

### Workflow 5: Using GLM (ZhipuAI)

```bash
# Set up GLM with your API key
export ZAI_API_KEY=your-glm-key-here

# Configure to use GLM by default
vibespec config set provider glm
vibespec config set model "glm-4-flash"

# Parse requirements using GLM
vibespec parse requirements.txt --output spec.json

# GLM offers competitive pricing and excellent multilingual support
```

### Workflow 6: Team Configuration

```bash
# Set team defaults
vibespec config set provider claude
vibespec config set model claude-3-haiku-20240307
vibespec config set outputPath ./specs
vibespec config set useCache true

# Now all team members use the same config from vibes.config.json
```

## Example: Complete Flow

```bash
# 1. Create a requirement file
cat > feature.txt << EOF
Build an e-commerce product catalog with the following features:
- Browse products by category
- Search products by name and description
- Filter by price range
- Add products to wishlist
- Responsive design for mobile and desktop
Tech stack: React, TypeScript, TailwindCSS, Node.js, PostgreSQL
EOF

# 2. Parse the requirement
vibespec parse feature.txt --output catalog-spec.json

# 3. Validate the generated spec
vibespec validate catalog-spec.json

# 4. Check what's in the spec
cat catalog-spec.json

# 5. Check cache stats (if you parse again, it will be cached)
vibespec cache status
```

## Tips

1. **Better Results**: Provide more context in your requirements for better parsing:
   - Mention specific technologies
   - Include acceptance criteria
   - Specify the domain (frontend, backend, etc.)

2. **Cost Optimization**:
   - Enable caching to avoid repeated AI calls: `config set useCache true`
   - Use heuristic-only mode (no API key) for quick drafts

3. **Multiple Formats**: Choose the right format for your use case:
   ```bash
   # JSON - Best for general use and tooling compatibility
   vibespec parse input.txt --format json

   # YAML - Best for human readability
   vibespec parse input.txt --format yaml

   # TOON - Best for LLM consumption (20-60% fewer tokens)
   vibespec parse input.txt --format toon
   ```

4. **Multiple Providers**: Switch providers easily:
   ```bash
   vibespec parse input.txt --provider claude
   vibespec parse input.txt --provider openai
   vibespec parse input.txt --provider openrouter
   vibespec parse input.txt --provider glm
   ```

5. **Interactive Mode**: Use the wizard when you need more control:
   ```bash
   vibespec parse input.txt --interactive
   ```

6. **Batch Processing**: Create a script to process multiple files:
   ```bash
   for file in requirements/*.txt; do
     vibespec parse "$file" --output "specs/$(basename $file .txt).json"
   done
   ```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the [vibes-cli-spec-v5.json](vibes-cli-spec-v5.json) for the complete specification
- Set up your preferred AI provider and start generating specs!

## Troubleshooting

**Problem**: "Input too short"
- **Solution**: Provide at least 20 characters of text

**Problem**: "No API key found"
- **Solution**: Set one of: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, `ZAI_API_KEY`, or use `--token` flag
- **Free Option**: Use OpenRouter's free tier - sign up at openrouter.ai
- **Alternative**: Use GLM (ZhipuAI) - sign up at open.bigmodel.cn

**Problem**: "AI refinement failed"
- **Solution**: The CLI automatically falls back to heuristic parsing. Check your API key and network connection.

**Problem**: Components list has too much noise
- **Solution**: This is normal for heuristic-only parsing. Use AI refinement for better results.
