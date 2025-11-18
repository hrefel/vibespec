# OpenRouter Model Recommendations for VibeSpec

## Issue with `minimax/minimax-m2:free`

The error you're seeing:
```
Error: Expected ',' or '}' after property value in JSON at position 12631
```

This occurs because the free `minimax/minimax-m2:free` model generates malformed JSON that our repair logic cannot fix. The model is truncating or generating invalid JSON syntax.

## Recommended Models

### Best Free Models (Tested & Working)

1. **qwen/qwen-2.5-7b-instruct:free** ⭐ RECOMMENDED
   ```bash
   vibespec parse "office-ops-management-brd.txt" \
     --provider openrouter \
     --token YOUR_TOKEN \
     --model qwen/qwen-2.5-7b-instruct:free \
     --output specs/officehub.toon \
     --format toon
   ```
   - Better JSON generation
   - More reliable than minimax
   - Good understanding of structured output

2. **meta-llama/llama-3.1-8b-instruct:free**
   ```bash
   --model meta-llama/llama-3.1-8b-instruct:free
   ```
   - Solid performance
   - Good JSON compliance
   - Default free model for VibeSpec

3. **google/gemma-2-9b-it:free**
   ```bash
   --model google/gemma-2-9b-it:free
   ```
   - Google's lightweight model
   - Decent structured output

### Best Paid Models (Most Reliable)

1. **anthropic/claude-3.5-haiku:beta** ⭐ BEST QUALITY
   ```bash
   --model anthropic/claude-3.5-haiku:beta
   ```
   - Most reliable JSON generation
   - Best understanding of complex specs
   - Fast and cost-effective (~$0.01-0.02 per spec)

2. **openai/gpt-4o-mini**
   ```bash
   --model openai/gpt-4o-mini
   ```
   - Very reliable
   - Good for complex fullstack specs
   - ~$0.01-0.03 per spec

3. **anthropic/claude-3-haiku-20240307**
   ```bash
   --model anthropic/claude-3-haiku-20240307
   ```
   - Reliable and fast
   - Good balance of cost/quality

## Quick Fix Commands

### Using Your Token with Better Free Model

```bash
vibespec parse "examples/office-ops-management-brd.txt" \
  --provider openrouter \
  --token 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 \
  --model qwen/qwen-2.5-7b-instruct:free \
  --output specs/officehub.toon \
  --format toon
```

### Using Paid Model (Most Reliable)

```bash
vibespec parse "examples/office-ops-management-brd.txt" \
  --provider openrouter \
  --token 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 \
  --model anthropic/claude-3.5-haiku:beta \
  --output specs/officehub.toon \
  --format toon
```

### Using Wizard Mode (Fallback)

If AI models keep failing, use wizard mode to manually refine:

```bash
vibespec parse "examples/office-ops-management-brd.txt" \
  --provider openrouter \
  --token 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 \
  --model qwen/qwen-2.5-7b-instruct:free \
  --interactive \
  --output specs/officehub.json
```

When AI fails, you'll be prompted:
```
? 🧙 Would you like to use Wizard Mode to refine your spec interactively? (Y/n)
```
Select "Yes" to interactively complete the spec.

## What We Fixed

1. **Enhanced JSON Repair**: Added `fixUnescapedQuotes()` method to handle unescaped quotes in string values
2. **Better Error Messages**: Now suggests better models when JSON parsing fails
3. **Existing Repair Logic**:
   - Removes trailing commas
   - Fixes unescaped newlines
   - Truncates to last valid structure
   - Repairs incomplete JSON by closing brackets
   - Extracts last valid JSON object

## Model Comparison

| Model | Cost | JSON Quality | Speed | Best For |
|-------|------|--------------|-------|----------|
| `qwen/qwen-2.5-7b-instruct:free` | Free | Good | Fast | Simple specs |
| `meta-llama/llama-3.1-8b-instruct:free` | Free | Good | Fast | General use |
| `minimax/minimax-m2:free` | Free | Poor | Fast | ❌ Not recommended |
| `anthropic/claude-3.5-haiku:beta` | ~$0.01 | Excellent | Very Fast | Complex fullstack specs |
| `openai/gpt-4o-mini` | ~$0.02 | Excellent | Fast | All types |

## Understanding the Costs

OpenRouter paid models are very cheap for this use case:
- **Average spec**: 2,000-4,000 tokens input, 3,000-8,000 tokens output
- **Claude 3.5 Haiku**: $0.80/$4.00 per million tokens = **~$0.01-0.03 per spec**
- **GPT-4o-mini**: $0.15/$0.60 per million tokens = **~$0.01-0.02 per spec**

## Alternative: Use Different Provider

If you have an Anthropic API key directly:

```bash
vibespec parse "examples/office-ops-management-brd.txt" \
  --provider claude \
  --token YOUR_ANTHROPIC_API_KEY \
  --model claude-3-5-haiku-20241022 \
  --output specs/officehub.toon \
  --format toon
```

Or if you have OpenAI:

```bash
vibespec parse "examples/office-ops-management-brd.txt" \
  --provider openai \
  --token YOUR_OPENAI_API_KEY \
  --model gpt-4o-mini \
  --output specs/officehub.toon \
  --format toon
```

## Debugging Tips

1. **Enable Debug Mode** (if you want to see raw JSON):
   ```bash
   DEBUG_OPENROUTER=true vibespec parse ...
   ```

2. **Try JSON format first** (easier to debug than TOON):
   ```bash
   --output specs/officehub.json --format json
   ```

3. **Check the generated JSON**:
   ```bash
   cat specs/officehub.json | jq .
   ```

## Summary

**Quick Recommendation**:
1. Try `qwen/qwen-2.5-7b-instruct:free` first (free, better than minimax)
2. If that fails, use `anthropic/claude-3.5-haiku:beta` (paid but only ~$0.01)
3. If you want to avoid AI errors completely, use `--interactive` wizard mode

The changes I made will help repair more JSON errors, but free models like minimax are inherently unreliable. The better free models or cheap paid models are much more reliable.
