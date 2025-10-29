# Troubleshooting Guide for VibeSpec CLI

## OpenRouter JSON Parsing Errors

### Issue: "Failed to parse OpenRouter response: Unterminated string in JSON"

This error occurs when OpenRouter's response contains malformed JSON, often due to incomplete or truncated responses.

#### Solutions:

**1. Try a Different Model**

Some models produce more reliable JSON output:

```bash
# Try Google Gemma (often more reliable with JSON)
node dist/index.js parse test-simple.txt \
  --provider openrouter \
  --model "google/gemma-2-9b-it:free"

# Try Mistral
node dist/index.js parse test-simple.txt \
  --provider openrouter \
  --model "mistralai/mistral-7b-instruct:free"
```

**2. Use a Simpler/Shorter Input**

Long inputs may cause truncated responses:

```bash
# Test with simple input first
node dist/index.js parse test-simple.txt --provider openrouter
```

**3. Enable Debug Mode**

See the raw response to understand what's happening:

```bash
DEBUG_OPENROUTER=1 node dist/index.js parse test-simple.txt --provider openrouter
```

**4. Increase max_tokens (if you have a paid account)**

Edit `src/core/ai-adapters.ts` line ~326:
```typescript
max_tokens: 3000,  // Increase from 2000
```

**5. Fall Back to Heuristic Mode**

If AI parsing continues to fail:

```bash
# Use wizard mode instead
node dist/index.js parse test-simple.txt --interactive

# Or use heuristic only (no AI)
node dist/index.js parse test-simple.txt
```

**6. Try a Paid Model**

Free models may have more rate limits and reliability issues:

```bash
# If you have credits, try a paid model
node dist/index.js parse test-simple.txt \
  --provider openrouter \
  --model "openai/gpt-3.5-turbo"
```

## Common OpenRouter Errors

### Error: "OpenRouter API error (401): Unauthorized"

**Cause:** Invalid or missing API key

**Solutions:**
```bash
# Check if key is set
echo $OPENROUTER_API_KEY

# Set it correctly (no quotes or spaces)
export OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Or add to .env file
echo "OPENROUTER_API_KEY=sk-or-v1-xxxxx" >> .env
```

### Error: "OpenRouter API error (429): Too Many Requests"

**Cause:** Rate limit exceeded

**Solutions:**
```bash
# Wait 1-2 minutes
sleep 120

# Try a different model
node dist/index.js parse test.txt \
  --provider openrouter \
  --model "google/gemma-2-9b-it:free"

# Use cache to avoid repeated calls
node dist/index.js parse test.txt --provider openrouter
# Second call will use cache
```

### Error: "OpenRouter API error (402): Payment Required"

**Cause:** Model requires credits or free tier exhausted

**Solutions:**
```bash
# Switch to a different free model
node dist/index.js parse test.txt \
  --provider openrouter \
  --model "meta-llama/llama-3.1-8b-instruct:free"

# Check available free models at:
# https://openrouter.ai/models?supported_parameters=tools&max_price=0
```

### Error: "Empty response from OpenRouter API"

**Cause:** Model returned no content

**Solutions:**
```bash
# Try different model
node dist/index.js parse test.txt \
  --provider openrouter \
  --model "mistralai/mistral-7b-instruct:free"

# Disable cache
node dist/index.js parse test.txt --provider openrouter --no-cache

# Check OpenRouter status
# Visit: https://status.openrouter.ai/
```

## General Troubleshooting

### Build Errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build

# Check TypeScript version
npm list typescript

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Input Too Short Error

```bash
# Minimum 20 characters required
echo "Build a todo app with CRUD operations" | wc -c
# Should be > 20
```

### Cache Issues

```bash
# Clear cache
node dist/index.js cache clear

# Check cache status
node dist/index.js cache status

# Disable cache for testing
node dist/index.js parse test.txt --no-cache
```

### Config Issues

```bash
# Reset to defaults
rm vibes.config.json

# View current config
node dist/index.js config list

# Set provider explicitly
node dist/index.js config set provider openrouter
```

## Best Practices to Avoid Issues

### 1. Use Simpler Inputs First

```bash
# Good: Simple and clear
"Build a blog with posts and comments using React"

# Avoid: Too long or complex for first test
"Build a comprehensive enterprise-grade microservices architecture with..."
```

### 2. Enable Caching

```bash
# Set cache on (default)
node dist/index.js config set useCache true

# This avoids repeated API calls
```

### 3. Choose Reliable Models

**Most Reliable (in our testing):**
1. `google/gemma-2-9b-it:free`
2. `meta-llama/llama-3.1-8b-instruct:free`
3. `mistralai/mistral-7b-instruct:free`

```bash
# Set reliable model as default
node dist/index.js config set model "google/gemma-2-9b-it:free"
```

### 4. Handle Errors Gracefully

The CLI automatically falls back to heuristic parsing if AI fails:

```bash
# Will try AI first, fall back to heuristic if it fails
node dist/index.js parse test.txt --provider openrouter
```

### 5. Test Incrementally

```bash
# 1. Test basic functionality
node dist/index.js --version

# 2. Test heuristic only (no API)
node dist/index.js parse test-simple.txt

# 3. Test with AI
node dist/index.js parse test-simple.txt --provider openrouter

# 4. Test complex inputs
node dist/index.js parse test-openrouter.txt --provider openrouter
```

## Debug Mode

For detailed debugging information:

```bash
# Enable debug mode
DEBUG_OPENROUTER=1 node dist/index.js parse test.txt --provider openrouter 2>&1 | tee debug.log

# Check the debug.log for raw API responses
```

## Getting Help

If issues persist:

1. **Check OpenRouter Status**: https://status.openrouter.ai/
2. **Check Model Status**: https://openrouter.ai/models
3. **OpenRouter Discord**: Join for community support
4. **GitHub Issues**: Report bugs at your project repo

## Alternative Providers

If OpenRouter continues to have issues, try other providers:

```bash
# Use OpenAI (requires API key)
export OPENAI_API_KEY=your-key
node dist/index.js parse test.txt --provider openai

# Use Claude (requires API key)
export ANTHROPIC_API_KEY=your-key
node dist/index.js parse test.txt --provider claude

# Use wizard mode (interactive, no AI)
node dist/index.js parse test.txt --interactive

# Use heuristic only (fast, no API needed)
node dist/index.js parse test.txt
```

## Quick Fixes Summary

| Error | Quick Fix |
|-------|-----------|
| Unterminated JSON | Try `--model "google/gemma-2-9b-it:free"` |
| 401 Unauthorized | Check `echo $OPENROUTER_API_KEY` |
| 429 Rate Limit | Wait 2 minutes or try different model |
| Empty Response | Try `--no-cache` flag |
| Slow Response | Use simpler input or different model |
| Build Error | `rm -rf dist/ && npm run build` |

## Reporting Bugs

When reporting issues, include:

1. Command you ran
2. Full error message
3. Output of `node dist/index.js --version`
4. Model being used
5. Input file size
6. Debug log (if available)

Example bug report:
```
Command: node dist/index.js parse test.txt --provider openrouter
Error: Failed to parse OpenRouter response: Unterminated string...
Version: 6.0.0
Model: meta-llama/llama-3.1-8b-instruct:free
Input: 500 characters
Debug log: [attach debug.log]
```
