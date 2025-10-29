# Testing Guide for VibeSpec CLI with OpenRouter

## 📋 Test Files Overview

This directory contains several test files to help you validate the OpenRouter integration:

### Test Requirement Files

1. **`test-simple.txt`** - Simple blog website (quick test)
2. **`test-openrouter.txt`** - Complex fullstack task management app (comprehensive test)
3. **`test-mobile.txt`** - Mobile fitness app with React Native
4. **`test-backend.txt`** - Backend API for e-commerce

### Test Scripts

- **`test-providers.sh`** - Automated script to test different providers
- **`TEST_COMMANDS.md`** - Complete list of test commands
- **`TESTING_OPENROUTER.md`** - Detailed OpenRouter testing guide

## 🚀 Quick Start (3 Steps)

### Step 1: Get Free OpenRouter API Key

1. Visit https://openrouter.ai/
2. Sign up (free)
3. Get API key from https://openrouter.ai/keys

### Step 2: Set API Key

```bash
export OPENROUTER_API_KEY=your-key-here
```

### Step 3: Run Test

```bash
# Easy way
./test-providers.sh openrouter

# Or manual way
node dist/index.js parse test-simple.txt --provider openrouter
```

## 📝 What to Test

### ✅ Basic Functionality Tests

```bash
# 1. Test OpenRouter works
node dist/index.js parse test-simple.txt --provider openrouter

# 2. Test output is valid JSON
node dist/index.js parse test-simple.txt --provider openrouter --output output.json
cat output.json | jq .

# 3. Test validation works
node dist/index.js validate output.json
```

### ✅ Feature Tests

```bash
# Different models
node dist/index.js parse test-simple.txt --provider openrouter --model "google/gemma-2-9b-it:free"

# YAML output
node dist/index.js parse test-simple.txt --provider openrouter --format yaml

# Custom output path
node dist/index.js parse test-simple.txt --provider openrouter --output custom.json
```

### ✅ Configuration Tests

```bash
# Set as default provider
node dist/index.js config set provider openrouter
node dist/index.js config list

# Parse without specifying provider (should use openrouter)
node dist/index.js parse test-simple.txt
```

### ✅ Comparison Tests

```bash
# Compare AI vs No AI
./test-providers.sh openrouter  # With AI
./test-providers.sh heuristic   # Without AI

# Compare outputs
diff test-output-openrouter.json test-output-heuristic.json
```

## 🔍 What to Verify

After running tests, check that:

1. **Command Completes Successfully**
   - No errors during execution
   - Exit code is 0

2. **Output Structure is Correct**
   ```bash
   cat output.json | jq 'keys'
   # Should show: title, domain, description, requirements, components, tech_stack, acceptance_criteria, ai_guidance, metadata
   ```

3. **Metadata Shows OpenRouter**
   ```bash
   cat output.json | jq '.metadata.processing.provider'
   # Should show: "openrouter"
   ```

4. **Content Quality is Good**
   - Requirements are specific and actionable
   - Tech stack is appropriate
   - Components make sense for the domain
   - AI guidance is relevant

5. **Different from Heuristic Output**
   - AI-refined output should be more polished
   - Better structured requirements
   - More relevant components

## 🐛 Common Issues & Solutions

### Issue: "No API key found"
**Solution:**
```bash
export OPENROUTER_API_KEY=your-key-here
# Or check .env file
cat .env | grep OPENROUTER
```

### Issue: "OpenRouter API error (401)"
**Solution:** API key is invalid
- Get a new key from https://openrouter.ai/keys
- Make sure there are no extra spaces or quotes

### Issue: "OpenRouter API error (429)"
**Solution:** Rate limit hit
- Wait 1-2 minutes
- Try a different free model
- Check OpenRouter dashboard for limits

### Issue: Empty or invalid response
**Solution:**
```bash
# Try with cache disabled
node dist/index.js parse test-simple.txt --provider openrouter --no-cache

# Try different model
node dist/index.js parse test-simple.txt --provider openrouter --model "google/gemma-2-9b-it:free"
```

## 📊 Expected Results

### Successful Test Output Should Show:

```
🔮 Vibes CLI - Parsing Requirement

→ Reading input...
  Input length: XXX characters

→ Processing with heuristic parser...
  Confidence: 0.XX

→ Refining with AI (openrouter)...
  Model: meta-llama/llama-3.1-8b-instruct:free

✓ Spec generated successfully

📄 Output saved to: output.json
```

### Sample JSON Output Structure:

```json
{
  "title": "Real-Time Collaborative Task Management Application",
  "domain": "fullstack",
  "description": "A comprehensive task management system...",
  "requirements": [
    "User authentication and authorization with JWT tokens",
    "Create, edit, and delete tasks with priority levels"
  ],
  "components": [
    "Authentication Service",
    "Task Manager",
    "Real-time Sync Engine"
  ],
  "tech_stack": [
    "React",
    "TypeScript",
    "Node.js",
    "PostgreSQL"
  ],
  "acceptance_criteria": [
    "Real-time updates should occur within 1 second"
  ],
  "ai_guidance": "Focus on WebSocket connection reliability...",
  "metadata": {
    "spec_version": "1.0.0",
    "generated_by": "vibes-cli v5.0.0",
    "processing": {
      "provider": "openrouter",
      "model": "meta-llama/llama-3.1-8b-instruct:free",
      "ai_refinement_applied": true
    }
  }
}
```

## 🎯 Test Scenarios by Complexity

### 🟢 Easy (30 seconds)
```bash
node dist/index.js parse test-simple.txt --provider openrouter
```

### 🟡 Medium (1-2 minutes)
```bash
node dist/index.js parse test-mobile.txt --provider openrouter --output mobile.json
node dist/index.js validate mobile.json
```

### 🔴 Advanced (3-5 minutes)
```bash
# Full workflow with multiple providers
./test-providers.sh openrouter
./test-providers.sh heuristic
diff test-output-openrouter.json test-output-heuristic.json | head -50
```

## 📚 Additional Resources

- **OpenRouter Documentation:** https://openrouter.ai/docs
- **Available Models:** https://openrouter.ai/models
- **Model Rankings:** https://openrouter.ai/rankings
- **API Status:** https://status.openrouter.ai/

## ✅ Testing Checklist

Before considering testing complete, verify:

- [ ] OpenRouter provider works with default model
- [ ] Can specify custom model
- [ ] JSON output is valid
- [ ] YAML output is valid
- [ ] Validation passes
- [ ] Metadata shows correct provider
- [ ] Output quality is better than heuristic-only
- [ ] Config set/get works
- [ ] Cache works correctly
- [ ] Error messages are helpful
- [ ] Different input files work

## 🎉 Success!

If all tests pass, the OpenRouter integration is working correctly!

Next steps:
1. Try with your own requirements
2. Compare different free models
3. Integrate into your workflow
4. Share feedback or issues

Happy testing! 🚀
