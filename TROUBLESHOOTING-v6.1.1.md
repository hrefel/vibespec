# VibeSpec v6.1.1 Troubleshooting Guide

## Error: "Missing required fields in AI response"

### Symptoms
```
AI refinement failed: OpenRouter API error: Failed to parse OpenRouter response: Missing required fields in AI response
```

### Root Causes
1. **Free AI models hitting token limits** - Free models on OpenRouter often can't handle the detailed enhanced prompts
2. **Model capacity** - Smaller models struggle with complex JSON structures
3. **Incomplete responses** - Model stops mid-response due to token limits

### Solutions (In Order of Effectiveness)

#### ✅ Solution 1: Switch to OpenAI or Claude (Best)
The enhanced prompts work best with capable models:

```bash
# Edit your .env file:
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-actual-key-here
```

Or use Claude:
```bash
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your-claude-key-here
```

#### ✅ Solution 2: Automatic Simplified Prompts (Already Applied)
As of v6.1.1, OpenRouter automatically uses simplified prompts that:
- Are 60% shorter
- Focus on essential fields first
- Work better with free models

**This is already enabled!** Just try your command again.

#### ✅ Solution 3: Simplify Your Requirements
Break complex requirements into simpler parts:

**Instead of:**
```
"Create a comprehensive fullstack e-commerce platform with user authentication, product catalog with search, shopping cart, checkout with Stripe, order management, admin dashboard, email notifications, and real-time inventory updates"
```

**Try:**
```
"Create a product catalog API. Products have name, price, and stock quantity. Support CRUD operations."
```

Then generate additional specs for auth, cart, etc.

#### ✅ Solution 4: Check the Error Details
v6.1.1 now shows exactly which fields are missing:

```
[Missing Required Fields]
Missing: description
Parsed object keys: title, domain, requirements, entities
```

This tells you the AI almost succeeded - it just forgot `description`. Try again, it might work on second attempt.

##Fix Applied in This Update

### What Changed
1. **Better error messages** - Now shows exactly which fields are missing
2. **Simplified prompts for OpenRouter** - Automatically uses shorter, clearer prompts
3. **Improved JSON repair** - Better handling of incomplete responses

### Updated Files
- `src/core/ai-adapters.ts` - Better error reporting
- `src/core/fullstack-prompts.ts` - Added simplified prompt mode

## Quick Test

Try this simple test to verify it's working:

```bash
vibespec generate "Create a simple todo API with tasks that have title and completed status"
```

If this works, gradually increase complexity:

```bash
vibespec generate "Create a task management API. Tasks have title, description, priority (low/medium/high), and status (todo/in_progress/done). Support CRUD operations."
```

## Expected Results

### With OpenAI/Claude (Best)
✅ Complete entities with all fields
✅ All API endpoints with schemas
✅ Validation rules
✅ Type definitions
✅ Data mapping
✅ Enhanced AI guidance

### With OpenRouter Free Models (Good)
✅ Basic entities with main fields
✅ Core API endpoints
✅ Essential validation
⚠️ May miss optional fields (type_definitions, data_mapping)
⚠️ Less detailed AI guidance

## Still Having Issues?

### Debug Step 1: Check Which Fields Are Missing
Look at the console output:
```
[Missing Required Fields]
Missing: title, description
```

### Debug Step 2: Try Different Provider
```bash
# If OpenRouter fails, try OpenAI
AI_PROVIDER=openai vibespec generate "your requirement"
```

### Debug Step 3: Verify API Keys
```bash
# Check your .env file has valid keys
cat .env | grep -E "(OPENAI|ANTHROPIC|OPENROUTER)_API_KEY"
```

### Debug Step 4: Use Simpler Requirements
Start with absolute basics:
```bash
vibespec generate "Create a User entity with email and name fields"
```

## Recommendations

### For Production Use
**Use OpenAI GPT-4o-mini or Claude-3-Haiku**
- Consistent results
- Complete specs
- All enhanced features work
- Worth the small cost

### For Testing/Development
**Use OpenRouter free models**
- Good enough for basic specs
- May need multiple attempts
- Some optional fields may be missing
- Simplified prompts active automatically

### For Learning
**Start simple, then add complexity**
```bash
# Start here
vibespec generate "Create a task API"

# Then add details
vibespec generate "Create a task API with priority and status"

# Then add full requirements
vibespec generate "Create a fullstack task management system..."
```

## Contact/Support

If issue persists:
1. Check which AI provider you're using (`echo $AI_PROVIDER`)
2. Try a different provider
3. Share the full error message
4. Include your requirement text
5. Check [FULLSTACK-IMPROVEMENTS-GUIDE.md](FULLSTACK-IMPROVEMENTS-GUIDE.md)
