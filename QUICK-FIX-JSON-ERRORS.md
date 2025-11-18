# Quick Fix: JSON Parsing Errors

## ⚠️ Error Message
```
AI refinement failed: OpenRouter API error: Failed to parse OpenRouter response:
Expected ',' or ']' after array element in JSON at position 11876
```

## 🔧 Quick Fixes (Try in Order)

### 1. ✅ Simplify Your Input (Easiest)
```bash
# Instead of this:
vibes "Create comprehensive restaurant reservation system with users, restaurants, reservations, menus, reviews, ratings, calendar integration, email notifications..."

# Try this:
vibes "Create restaurant reservation API with users, restaurants, and reservations"
```

### 2. ✅ Use a Better Model (Recommended)
```bash
# Free model (may fail on complex specs)
vibes "requirement" --provider openrouter

# Better: Use OpenAI (small cost, reliable)
vibes "requirement" --provider openai --model gpt-4o-mini

# Best: Use Claude (best quality)
vibes "requirement" --provider claude --model claude-3-haiku-20240307
```

### 3. ✅ Update to Latest Version
```bash
npm install -g vibespec-cli@latest
# or
npm run build  # if developing locally
```

### 4. ✅ Break Into Smaller Specs
```bash
# Step 1: Core entities
vibes "Task API with users and tasks" --output task-core.json

# Step 2: Add features
vibes "Add comments to tasks" --output task-comments.json

# Step 3: Merge manually or use as references
```

### 5. ✅ Use Heuristic-Only Mode
```bash
# Skip AI refinement (fast, always works)
vibes "requirement" --no-ai
```

---

## 🎯 One-Line Solutions

### For Simple Specs
```bash
vibes "simple requirement" --provider openrouter  # Should work
```

### For Medium Specs
```bash
vibes "medium requirement" --provider openai --model gpt-4o-mini
```

### For Complex Specs
```bash
vibes "complex requirement" --provider claude --model claude-3-haiku-20240307
```

### When Everything Fails
```bash
vibes "requirement" --no-ai  # Heuristic only, no AI refinement
```

---

## 📊 Model Comparison

| Provider | Model | Best For | Reliability |
|----------|-------|----------|-------------|
| openrouter | llama-3.1-8b (free) | Simple specs (1-3 entities) | ⭐⭐ 60% |
| openai | gpt-4o-mini | Medium specs (4-6 entities) | ⭐⭐⭐⭐ 90% |
| claude | haiku | Complex specs (7+ entities) | ⭐⭐⭐⭐⭐ 95% |

---

## 🔍 Debug If Still Failing

```bash
# Enable debug output
export DEBUG_OPENROUTER=1
vibes "requirement" --provider openrouter

# Check the logs for:
# - "Raw response" (shows what model returned)
# - "Attempting repair" (shows repair attempts)
# - "Around error position" (shows where JSON broke)
```

---

## 📝 What Changed in v6.1.2

✅ **Auto-repair for incomplete JSON**
- Truncates at last valid structure
- Closes unterminated strings/arrays/objects
- Extracts largest valid JSON chunk

✅ **Increased token limit**
- 4000 → 8000 tokens
- Reduces truncation issues

✅ **Simplified prompts**
- Less verbose for free models
- More room for response

✅ **Better error messages**
- Shows error position context
- Displays attempted repairs
- Lists missing fields

---

## 💡 Pro Tips

1. **Start simple, add complexity gradually**
2. **Free models work for prototyping, paid for production**
3. **Always review generated specs (AI can make mistakes)**
4. **Use validation**: `cat output.json | jq .`
5. **Keep requirements under 200 words for free models**

---

## ❓ Still Having Issues?

1. Check API keys are set:
   ```bash
   echo $OPENAI_API_KEY
   echo $ANTHROPIC_API_KEY
   echo $OPENROUTER_API_KEY
   ```

2. Verify model availability:
   ```bash
   vibes --list-models
   ```

3. Test with minimal input:
   ```bash
   vibes "Create a user API" --provider openrouter
   ```

4. If all else fails, report bug with:
   - Error message (full output)
   - Input requirement
   - Provider and model used
   - `DEBUG_OPENROUTER=1` output

---

**Quick Reference**
- 📖 Full guide: [TROUBLESHOOTING-JSON-PARSING.md](TROUBLESHOOTING-JSON-PARSING.md)
- 📋 Spec standard: [SPEC-STANDARD-DOCUMENTATION.md](SPEC-STANDARD-DOCUMENTATION.md)
- 🏗️ Template: [spec-standard-template.json](spec-standard-template.json)

---

**Version:** 6.1.2 | **Last Updated:** 2025-11-03
