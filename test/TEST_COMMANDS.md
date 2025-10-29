# Quick Test Commands for OpenRouter Integration

## Prerequisites

```bash
# 1. Make sure project is built
npm run build

# 2. Set your OpenRouter API key (get free key at openrouter.ai)
export OPENROUTER_API_KEY=your-key-here
```

## Quick Tests

### Test 1: Simple Requirement (Fast)
```bash
node dist/index.js parse test-simple.txt --provider openrouter
```

### Test 2: Complex Fullstack App
```bash
node dist/index.js parse test-openrouter.txt --provider openrouter --output openrouter-fullstack.json
```

### Test 3: Mobile App
```bash
node dist/index.js parse test-mobile.txt --provider openrouter --output openrouter-mobile.json
```

### Test 4: Backend API
```bash
node dist/index.js parse test-backend.txt --provider openrouter --output openrouter-backend.json
```

### Test 5: Direct Text Input
```bash
node dist/index.js parse "Build a weather dashboard that shows current conditions and 7-day forecast using React and OpenWeather API" --provider openrouter
```

## Compare Providers

### OpenRouter (Free) vs Heuristic (No AI)
```bash
# With OpenRouter AI
node dist/index.js parse test-simple.txt --provider openrouter --output compare-openrouter.json

# Without AI (heuristic only)
node dist/index.js parse test-simple.txt --output compare-heuristic.json

# Compare the results
echo "=== OpenRouter Output ===" && cat compare-openrouter.json | jq '.requirements'
echo "=== Heuristic Output ===" && cat compare-heuristic.json | jq '.requirements'
```

## Test Different Models

### Test Free Llama Model (Default - Fast)
```bash
node dist/index.js parse test-simple.txt \
  --provider openrouter \
  --model "meta-llama/llama-3.1-8b-instruct:free"
```

### Test Free Gemma Model (Google)
```bash
node dist/index.js parse test-simple.txt \
  --provider openrouter \
  --model "google/gemma-2-9b-it:free"
```

### Test Free Mistral Model
```bash
node dist/index.js parse test-simple.txt \
  --provider openrouter \
  --model "mistralai/mistral-7b-instruct:free"
```

## Test Output Formats

### JSON (Default)
```bash
node dist/index.js parse test-simple.txt --provider openrouter --format json
```

### YAML
```bash
node dist/index.js parse test-simple.txt --provider openrouter --format yaml
```

## Test Interactive Mode

```bash
# Launch wizard for guided spec creation
node dist/index.js parse test-simple.txt --interactive
```

## Test Configuration

### Set OpenRouter as Default
```bash
node dist/index.js config set provider openrouter
node dist/index.js config set model "meta-llama/llama-3.1-8b-instruct:free"
node dist/index.js config list
```

### Now Parse Without Specifying Provider
```bash
node dist/index.js parse test-simple.txt
```

## Test Validation

```bash
# Generate a spec
node dist/index.js parse test-simple.txt --provider openrouter --output test-spec.json

# Validate it
node dist/index.js validate test-spec.json
```

## Test Cache

```bash
# First run (no cache)
time node dist/index.js parse test-simple.txt --provider openrouter

# Second run (should use cache - much faster)
time node dist/index.js parse test-simple.txt --provider openrouter

# Disable cache
node dist/index.js parse test-simple.txt --provider openrouter --no-cache
```

## Test Error Handling

### Test Without API Key
```bash
unset OPENROUTER_API_KEY
node dist/index.js parse test-simple.txt --provider openrouter
# Should show error message with instructions
```

### Test Invalid Input
```bash
node dist/index.js parse "short" --provider openrouter
# Should fail - input too short
```

## Automated Test Script

```bash
# Run all tests with the provided script
./test-providers.sh openrouter
./test-providers.sh heuristic
```

## View Results

### Pretty Print JSON
```bash
cat test-output-openrouter.json | jq '.'
```

### Extract Specific Fields
```bash
# View title and domain
cat test-output-openrouter.json | jq '{title, domain}'

# View requirements only
cat test-output-openrouter.json | jq '.requirements'

# View metadata
cat test-output-openrouter.json | jq '.metadata'

# View tech stack
cat test-output-openrouter.json | jq '.tech_stack'
```

## Performance Testing

```bash
# Test response time
echo "Testing OpenRouter performance..."
time node dist/index.js parse test-simple.txt --provider openrouter --no-cache
```

## Debugging

### Enable Verbose Output
```bash
# Check what's happening step by step
node dist/index.js parse test-simple.txt --provider openrouter 2>&1 | tee debug.log
```

### Check Provider Configuration
```bash
# View available provider configs in code
grep -A 10 "openrouter:" src/types/config.ts
```

## Integration Test Workflow

```bash
# Complete workflow test
echo "1. Setting up configuration..."
node dist/index.js config set provider openrouter
node dist/index.js config set useCache true

echo "2. Parsing requirement..."
node dist/index.js parse test-openrouter.txt --output final-spec.json

echo "3. Validating output..."
node dist/index.js validate final-spec.json

echo "4. Checking cache status..."
node dist/index.js cache status

echo "5. Viewing results..."
cat final-spec.json | jq '.title, .domain, .requirements | length'

echo "✅ Integration test complete!"
```

## Expected Success Indicators

When testing is successful, you should see:

1. **Parse Command Output:**
   - "🔮 Vibes CLI - Parsing Requirement"
   - "→ Reading input..."
   - "→ Processing with heuristic parser..."
   - "→ Refining with AI (openrouter)..."
   - "✓ Spec generated successfully"

2. **Valid JSON Output:**
   - Contains all required fields: title, domain, description, requirements
   - Metadata shows provider as "openrouter"
   - Tech stack and components are populated

3. **Validation Passes:**
   - "✓ Spec is valid!"

## Troubleshooting Commands

```bash
# Check if build is up to date
ls -la dist/core/ai-adapters.js

# Verify OpenRouter adapter exists in compiled code
grep -n "OpenRouterAdapter" dist/core/ai-adapters.js

# Check available providers
grep -n "openrouter" dist/types/spec.js

# Test basic CLI functionality
node dist/index.js --version
node dist/index.js --help
```

## Clean Up Test Files

```bash
# Remove test outputs
rm -f test-output-*.json compare-*.json *-spec.json

# Clear cache
node dist/index.js cache clear
```
