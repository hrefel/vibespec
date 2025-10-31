# Troubleshooting Guide

## OpenRouter API Errors

### Error: "Unterminated string in JSON"

**Symptom:**
```
⚠ AI refinement failed: OpenRouter API error: Failed to parse OpenRouter response:
Unterminated string in JSON at position 107 (line 4 column 23)
```

**Cause:**
OpenRouter sometimes returns incomplete/streaming JSON responses, especially with free tier models. The JSON response gets cut off mid-string.

**Solutions:**

#### Solution 1: Automatic Repair (Already Implemented ✅)
The latest version includes automatic JSON repair that:
1. Detects unterminated strings
2. Closes unclosed quotes, brackets, and braces
3. Extracts the last valid JSON object if repair fails
4. Logs repair attempts for debugging

**To enable debug logging:**
```bash
export DEBUG_OPENROUTER=true
vibespec parse "your requirement"
```

#### Solution 2: Try a Different Model
Free tier models may be less reliable. Try a paid model:

```bash
# Try a more reliable model
vibespec config set provider openrouter
vibespec config set model "openai/gpt-3.5-turbo"

# Or use Claude
vibespec config set provider openrouter
vibespec config set model "anthropic/claude-3-haiku"
```

#### Solution 3: Use Different Provider
Switch to a more reliable provider:

```bash
# Use OpenAI directly
vibespec config set provider openai
export OPENAI_API_KEY=your-key

# Or use Claude directly
vibespec config set provider claude
export ANTHROPIC_API_KEY=your-key
```

#### Solution 4: Increase Token Limit
If response is being cut off, the model might need more tokens:

```bash
# Edit src/core/ai-adapters.ts
# Change max_tokens from 2000 to 3000
max_tokens: 3000,
```

#### Solution 5: Reduce Input Size
If your requirement is very long, try breaking it down:

```bash
# Instead of one long requirement
vibespec parse long-requirement.txt

# Split into smaller pieces
vibespec parse requirement-part1.txt
vibespec parse requirement-part2.txt
```

### Error: "Empty response from OpenRouter API"

**Cause:**
API returned 200 OK but with no content.

**Solutions:**
1. Check API key is valid
2. Check internet connection
3. Try again (API might be temporarily down)
4. Switch to different provider

### Error: "Missing required fields in AI response"

**Cause:**
AI returned valid JSON but missing required fields (title, domain, description, requirements).

**Solutions:**

#### Solution 1: Be More Specific
Provide more detail in your requirement:

```bash
# Too vague
vibespec parse "build a thing"

# Better
vibespec parse "Build a REST API endpoint for user login with email and password authentication"
```

#### Solution 2: Use Interactive Mode
Let the wizard help fill in missing fields:

```bash
vibespec parse "your requirement" --interactive
```

#### Solution 3: Fallback to Heuristic
If AI keeps failing, use heuristic-only parsing:

```bash
vibespec parse "your requirement" --no-ai
```

## Cache Issues

### Error: Cache taking too much memory

**Solutions:**

```bash
# Check cache status
vibespec cache status

# Clear cache
vibespec cache clear

# Disable cache
vibespec config set useCache false

# Or use --no-cache flag
vibespec parse input.txt --no-cache
```

## Configuration Issues

### Error: "No API key found"

**Solutions:**

```bash
# Option 1: Environment variable
export OPENAI_API_KEY=your-key
export ANTHROPIC_API_KEY=your-key
export OPENROUTER_API_KEY=your-key

# Option 2: .env file
echo "OPENAI_API_KEY=your-key" > .env

# Option 3: CLI flag
vibespec parse input.txt --token your-key

# Option 4: Config file
vibespec config set apiKey your-key
```

### Error: Cannot find module

**Solution:**

```bash
# Rebuild the project
npm run build

# Or reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Validation Errors

### Error: "Input too short"

**Cause:**
Requirement must be at least 20 characters.

**Solution:**
Provide more detail:

```bash
# Too short
vibespec parse "login"

# Better
vibespec parse "Create a user login endpoint with email and password"
```

### Error: "Title must start with capital letter"

**Solution:**
The spec validator requires titles to start with uppercase. This is automatically fixed by AI refinement, but if using heuristic-only:

```bash
# Edit the generated spec file manually
# Or provide a better title in input
vibespec parse "Build User Registration API"  # Capital B
```

## Provider-Specific Issues

### OpenAI Issues

**Rate Limit:**
```bash
# You've hit rate limits
# Wait a few minutes or upgrade your plan
```

**Invalid Model:**
```bash
# Check model name
vibespec config set model "gpt-4o-mini"  # Correct
vibespec config set model "gpt-4-mini"   # Wrong
```

### Claude Issues

**Rate Limit:**
```bash
# Anthropic has strict rate limits on free tier
# Use Haiku for better limits
vibespec config set model "claude-3-haiku-20240307"
```

### OpenRouter Issues

**Free Tier Limitations:**
```bash
# Free models may have:
# - Lower quality
# - Higher rate limits
# - Inconsistent responses

# Consider upgrading to paid models
vibespec config set model "openai/gpt-3.5-turbo"
```

## Debug Mode

Enable debug logging to see what's happening:

```bash
# Set environment variable
export DEBUG=vibespec:*
export DEBUG_OPENROUTER=true

# Run command
vibespec parse "your requirement"

# Check output for detailed logs
```

## Common Workflow Issues

### Issue: Generated spec is incomplete

**Solutions:**

1. **Use Interactive Mode:**
```bash
vibespec parse input.txt --interactive
```

2. **Provide More Context:**
```bash
# Bad
vibespec parse "user login"

# Good
vibespec parse "Create a REST API endpoint for user login.
Users should authenticate with email and password.
Return JWT token on success.
Lock account after 5 failed attempts."
```

3. **Use Appropriate Type:**
```bash
vibespec parse input.txt --type api-endpoint  # For APIs
vibespec parse input.txt --type entity       # For database models
vibespec parse input.txt --type feature      # For features
```

### Issue: AI generates wrong domain

**Solution:**

Use interactive mode to correct:

```bash
vibespec parse "your requirement" --interactive

# Wizard will ask:
# ? Select the domain:
#   > Frontend (UI, components, dashboards)
#     Backend (APIs, services, databases)
#     ...
```

### Issue: Spec missing constraints

**This is expected!** The new constraint system (not yet integrated) will:
1. Detect missing constraints
2. Launch constraint wizard
3. Guide you through adding business and technical constraints

**Temporary workaround:**
Add constraints manually to generated spec.

## Performance Issues

### Issue: Slow response times

**Solutions:**

1. **Enable Caching:**
```bash
vibespec config set useCache true
```

2. **Use Faster Model:**
```bash
# OpenAI
vibespec config set model "gpt-4o-mini"

# Claude
vibespec config set model "claude-3-haiku-20240307"

# OpenRouter free
vibespec config set model "meta-llama/llama-3.1-8b-instruct:free"
```

3. **Reduce Max Tokens:**
Edit `src/core/ai-adapters.ts` and reduce `max_tokens` from 2000 to 1000.

## File I/O Issues

### Error: Cannot write output file

**Solutions:**

```bash
# Ensure directory exists
mkdir -p specs/
vibespec parse input.txt --output specs/output.json

# Check permissions
chmod +w specs/

# Use absolute path
vibespec parse input.txt --output /full/path/to/output.json
```

### Error: Cannot read input file

**Solutions:**

```bash
# Check file exists
ls -la input.txt

# Use absolute path
vibespec parse /full/path/to/input.txt

# Or use stdin
cat input.txt | vibespec parse
```

## Getting Help

If none of these solutions work:

1. **Enable Debug Mode:**
```bash
export DEBUG=vibespec:*
export DEBUG_OPENROUTER=true
vibespec parse "your requirement" 2> debug.log
```

2. **Check Logs:**
```bash
cat debug.log
```

3. **Report Issue:**
Include in your bug report:
- Debug logs
- Command you ran
- Input file (if not sensitive)
- Your config: `vibespec config list`
- Provider and model being used
- Node version: `node --version`

4. **Try Fallbacks:**
```bash
# Fallback 1: Different provider
vibespec config set provider openai

# Fallback 2: Interactive mode
vibespec parse input.txt --interactive

# Fallback 3: Heuristic only
vibespec parse input.txt --no-ai

# Fallback 4: Different model
vibespec config set model "gpt-4o-mini"
```

## Quick Diagnostic

Run this diagnostic script:

```bash
#!/bin/bash
echo "=== VibeSpec Diagnostic ==="
echo ""
echo "Node version:"
node --version
echo ""
echo "NPM version:"
npm --version
echo ""
echo "Config:"
vibespec config list
echo ""
echo "Cache status:"
vibespec cache status
echo ""
echo "Environment variables:"
env | grep -E "(OPENAI|ANTHROPIC|OPENROUTER|VIBES)" | sed 's/=.*/=***/'
echo ""
echo "Test parse:"
vibespec parse "Test user login feature" --no-cache
```

Save as `diagnostic.sh`, run with `bash diagnostic.sh`
