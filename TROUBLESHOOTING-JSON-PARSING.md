# Troubleshooting JSON Parsing Errors

## Problem: AI refinement fails with JSON parsing errors

### Error Message
```
⚠ AI refinement failed: OpenRouter API error: Failed to parse OpenRouter response:
Expected ',' or ']' after array element in JSON at position 11876
```

### Root Cause
Free AI models (especially from OpenRouter) sometimes generate incomplete or malformed JSON due to:
1. **Token limits** - The model hits max_tokens before completing the JSON
2. **Model limitations** - Free models have less capacity/reliability
3. **Complex structures** - Large nested objects/arrays cause issues
4. **Unterminated strings** - Model stops mid-string

---

## Fixes Implemented (v6.1.2)

### 1. **Multi-Strategy JSON Repair**
The parser now attempts 3 repair strategies in order:

#### Strategy 1: Truncation
- Finds the last valid complete JSON structure
- Truncates everything after that point
- Most reliable for incomplete responses

#### Strategy 2: Repair by Closure
- Closes unterminated strings (adds missing `"`)
- Closes unterminated arrays (adds missing `]`)
- Closes unterminated objects (adds missing `}`)

#### Strategy 3: Backwards Extraction
- Searches backwards from the end
- Finds the largest parseable substring
- Uses that as the valid response

### 2. **Increased Token Limit**
```typescript
max_tokens: 8000  // Previously 4000
```

### 3. **Simplified Prompts**
Reduced prompt verbosity for free models to leave more room for response:
- Removed redundant examples
- Condensed instructions
- Focused on essential fields only

### 4. **Better Error Messages**
Now shows:
- Exact position of parse error
- Context around the error (characters 11800-11950 for error at 11876)
- First 500 chars of response
- Missing fields if validation fails

---

## Usage Recommendations

### For OpenRouter Free Models

1. **Use simpler input** - Free models work better with concise requirements:
   ```bash
   # Good ✓
   vibes "Create a task management API with users and tasks"

   # Too complex for free models ✗
   vibes "Create a comprehensive restaurant reservation system with advanced calendar integration..."
   ```

2. **Break down complex specs** - Generate in parts:
   ```bash
   # Part 1: Core entities
   vibes "Task management system with User and Task entities" --domain fullstack

   # Part 2: Add features
   vibes "Add comments and attachments to tasks" --domain fullstack
   ```

3. **Switch to paid models for complex specs**:
   ```bash
   # Use OpenAI (better for complex specs)
   vibes "complex requirement" --provider openai --model gpt-4o-mini

   # Use Claude (best quality)
   vibes "complex requirement" --provider claude --model claude-3-haiku-20240307
   ```

### Model Recommendations by Complexity

| Complexity | Recommended Provider | Model |
|------------|---------------------|-------|
| Simple (1-3 entities) | OpenRouter (free) | `meta-llama/llama-3.1-8b-instruct:free` |
| Medium (4-6 entities) | OpenAI | `gpt-4o-mini` |
| Complex (7+ entities) | Claude | `claude-3-haiku-20240307` |
| Production specs | Claude | `claude-3-5-sonnet-20241022` |

---

## Debugging

### Enable Debug Mode
```bash
export DEBUG_OPENROUTER=1
vibes "your requirement" --provider openrouter
```

This will show:
- Raw response from API (first 500 chars)
- Repair attempts and results
- Truncation points tested

### Check Token Usage
If you see incomplete JSON, the model likely hit `max_tokens`. Solutions:
1. Simplify your input
2. Use a larger model
3. Split into multiple specs

### Validate Output
After generation, validate the JSON:
```bash
# Use the built-in validator (when available)
vibes validate output.json --schema spec-schema-v1.0.0.json

# Or use jq
cat output.json | jq . > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
```

---

## Error Patterns and Solutions

### Pattern 1: Truncated at exact position (e.g., 11876)
**Cause**: Hit `max_tokens` limit
**Solution**:
- Use `--model` with higher capacity
- Simplify input
- Use simplified prompt (automatic for OpenRouter)

### Pattern 2: "Expected ',' or ']' after array element"
**Cause**: Incomplete array, missing closing bracket
**Solution**: Automatic truncation repair will handle this
**Manual**: Check the spec, the last array may be incomplete

### Pattern 3: "Unterminated string in JSON"
**Cause**: String quote not closed: `"description": "This is a...`
**Solution**: Automatic repair adds closing quote
**Manual**: Add closing `"` before the truncation point

### Pattern 4: Missing required fields
**Cause**: Model didn't generate required fields
**Solution**:
```bash
# Retry with more explicit prompt
vibes "IMPORTANT: Include title, domain, description, requirements. Create task management API" --provider openrouter

# Or switch provider
vibes "your requirement" --provider openai
```

---

## Testing the Fixes

### Test Case 1: Simple Spec (Should Always Work)
```bash
vibes "Create a simple to-do list API with tasks" --provider openrouter
```

Expected: Clean JSON with no repair needed

### Test Case 2: Medium Spec (May Need Repair)
```bash
vibes "Create a blog platform with users, posts, comments, and tags" --provider openrouter
```

Expected: May trigger truncation repair, but should succeed

### Test Case 3: Complex Spec (Use Better Model)
```bash
vibes "Create a restaurant reservation system with users, restaurants, reservations, menus, reviews, and calendar integration" --provider openai
```

Expected: Clean JSON from better model

---

## When to Report Bugs

Report an issue if:
1. ✅ Simple specs fail consistently (1-2 entities)
2. ✅ Repair strategies all fail for valid JSON
3. ✅ Error messages are not helpful
4. ✅ Validation fails for correctly formatted output

Don't report if:
1. ❌ Complex spec fails with free model (expected - use paid model)
2. ❌ Spec is incomplete but valid (model's limitation, not parser bug)
3. ❌ Model returns non-JSON (model issue, not parser bug)

---

## Advanced: Custom Repair Logic

If you need custom repair for specific patterns, edit:
```typescript
// src/core/ai-adapters.ts

private truncateToLastValidStructure(jsonStr: string): string {
  // Add your custom repair logic here
  // Example: Handle specific error patterns
  if (jsonStr.includes('specific-pattern')) {
    // Custom handling
  }

  // Existing logic...
}
```

---

## Performance Tips

### Faster Generation
1. Use heuristic-only mode (no AI):
   ```bash
   vibes "requirement" --no-ai
   ```

2. Use cache when available:
   ```bash
   # Subsequent calls are cached
   vibes "same requirement" --provider openrouter
   ```

3. Use faster models:
   ```bash
   vibes "requirement" --provider openrouter --model meta-llama/llama-3.1-8b-instruct:free
   ```

### Quality vs Speed

| Priority | Provider | Model | Speed | Quality | Cost |
|----------|----------|-------|-------|---------|------|
| Speed | OpenRouter | llama-3.1-8b | ⚡⚡⚡ | ⭐⭐ | Free |
| Balance | OpenAI | gpt-4o-mini | ⚡⚡ | ⭐⭐⭐⭐ | $ |
| Quality | Claude | sonnet | ⚡ | ⭐⭐⭐⭐⭐ | $$$ |

---

## Version History

### v6.1.2 (Current)
- ✅ Multi-strategy JSON repair (truncation, closure, extraction)
- ✅ Increased max_tokens to 8000
- ✅ Simplified prompts for free models
- ✅ Better error messages with context
- ✅ Debug mode for OpenRouter

### v6.1.1 (Previous)
- ⚠️ Basic JSON repair (closure only)
- ⚠️ max_tokens: 4000
- ⚠️ Limited error context

---

## FAQ

### Q: Why do free models fail more often?
**A:** Free models have:
- Lower capacity (smaller context windows)
- Less training (more errors)
- Stricter rate limits (more truncation)
- Lower priority (slower, less reliable)

### Q: Can I use my own API key for better results?
**A:** Yes! Use paid tiers:
```bash
# Set API keys
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...

# Use paid models
vibes "requirement" --provider openai --model gpt-4o
vibes "requirement" --provider claude --model claude-3-5-sonnet-20241022
```

### Q: What if JSON repair fails?
**A:** Try:
1. Simplify input requirement
2. Switch to better model/provider
3. Use `--no-ai` mode for heuristic-only
4. Manually edit the output JSON

### Q: How do I know if repair was triggered?
**A:** Look for these messages:
```
⚠️  Detected incomplete/malformed JSON from OpenRouter, attempting repair...
✓ Successfully repaired JSON by truncation
```

### Q: Is the repaired spec reliable?
**A:** Usually yes! The repair strategies:
- Only accept valid JSON
- Preserve required fields
- Validate structure
- Log what was repaired

But always review the output spec.

---

## Contact & Support

- GitHub Issues: https://github.com/vibespec-cli/issues
- Documentation: https://vibespec.dev/docs
- Discord: https://discord.gg/vibespec

---

**Last Updated:** 2025-11-03
**Version:** 6.1.2
