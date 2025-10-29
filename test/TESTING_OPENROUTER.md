# Testing OpenRouter Integration

This guide will help you test the new OpenRouter AI provider feature.

## Quick Start

### 1. Get an OpenRouter API Key (Free)

1. Visit [openrouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Go to the [Keys page](https://openrouter.ai/keys)
4. Create a new API key
5. Copy your key

### 2. Set Your API Key

```bash
export OPENROUTER_API_KEY=your-key-here
```

Or add it to your `.env` file:
```bash
echo "OPENROUTER_API_KEY=your-key-here" >> .env
```

### 3. Test with the Provided Script

```bash
# Easy way - use the test script
./test-providers.sh openrouter

# Or manually
node dist/index.js parse test-openrouter.txt --provider openrouter --output test-output.json
```

### 4. View the Results

```bash
# Pretty print the JSON output
cat test-output-openrouter.json | jq .

# Or just view the file
cat test-output-openrouter.json
```

## Test Different Scenarios

### Test 1: Default Free Model
```bash
node dist/index.js parse test-openrouter.txt --provider openrouter
```

### Test 2: Specific Free Model
```bash
node dist/index.js parse test-openrouter.txt \
  --provider openrouter \
  --model "google/gemma-2-9b-it:free"
```

### Test 3: With Custom Output
```bash
node dist/index.js parse test-openrouter.txt \
  --provider openrouter \
  --output my-custom-spec.json \
  --format json
```

### Test 4: YAML Output
```bash
node dist/index.js parse test-openrouter.txt \
  --provider openrouter \
  --format yaml
```

### Test 5: Compare with Other Providers

```bash
# OpenRouter (free)
./test-providers.sh openrouter

# Heuristic only (no AI, no key needed)
./test-providers.sh heuristic

# OpenAI (if you have a key)
./test-providers.sh openai

# Claude (if you have a key)
./test-providers.sh claude
```

## Available Free Models on OpenRouter

You can test with these free models:

```bash
# Fast Llama model (default)
--model "meta-llama/llama-3.1-8b-instruct:free"

# Google Gemma
--model "google/gemma-2-9b-it:free"

# Mistral
--model "mistralai/mistral-7b-instruct:free"

# Microsoft Phi-3
--model "microsoft/phi-3-mini-128k-instruct:free"
```

## Expected Output Structure

The generated spec should include:

```json
{
  "title": "Real-Time Collaborative Task Management Application",
  "domain": "fullstack",
  "description": "...",
  "requirements": [
    "User authentication and authorization with JWT tokens",
    "..."
  ],
  "components": [
    "Authentication Service",
    "Task Manager",
    "..."
  ],
  "tech_stack": [
    "React",
    "TypeScript",
    "Node.js",
    "..."
  ],
  "acceptance_criteria": [
    "Real-time updates should occur within 1 second",
    "..."
  ],
  "ai_guidance": "...",
  "metadata": {
    "spec_version": "1.0.0",
    "generated_by": "vibes-cli v5.0.0",
    "processing": {
      "provider": "openrouter",
      "model": "meta-llama/llama-3.1-8b-instruct:free",
      "ai_refinement_applied": true,
      "cache_hit": false
    }
  }
}
```

## Troubleshooting

### Error: "No API key found"
- Make sure you exported the API key: `export OPENROUTER_API_KEY=your-key`
- Or check your `.env` file has the key

### Error: "OpenRouter API error (401)"
- Your API key is invalid or expired
- Get a new key from [openrouter.ai/keys](https://openrouter.ai/keys)

### Error: "OpenRouter API error (429)"
- You've hit the rate limit
- Wait a few moments and try again
- Consider using a different free model

### Slow Response
- Free models may have longer response times during peak usage
- Try a different free model
- Check [openrouter.ai/models](https://openrouter.ai/models) for model status

## Configuration

Set OpenRouter as your default provider:

```bash
node dist/index.js config set provider openrouter
node dist/index.js config set model "meta-llama/llama-3.1-8b-instruct:free"
```

View current config:
```bash
node dist/index.js config list
```

## Next Steps

After testing:

1. Compare output quality between providers
2. Check the processing metadata in the output
3. Try different free models to see which works best
4. Integrate into your workflow

## Need Help?

- OpenRouter Docs: https://openrouter.ai/docs
- OpenRouter Models: https://openrouter.ai/models
- OpenRouter Discord: Join their community for support
