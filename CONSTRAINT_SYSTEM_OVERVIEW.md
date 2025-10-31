# Constraint System Overview

## 🎯 The Problem We Solved

When using AI to generate code, vague requirements lead to incorrect code. Your CLI now has a **constraint-focused system** that ensures requirements are:

- ✅ **Complete** - Both business and technical constraints defined
- ✅ **Clear** - No vague terms, specific and measurable
- ✅ **Structured** - Consistent format for AI parsing
- ✅ **Validated** - Quality checks before generation

## 🧩 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Raw Requirement Input                    │
│  "Create a user login API with email and password"          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Template System                            │
│  • Selects template based on type (API, Entity, etc.)       │
│  • Provides structure and example constraints                │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Constraint Validator                         │
│  • Analyzes raw input for constraints                        │
│  • Checks if business/technical constraints present          │
│  • Validates constraint quality                              │
└─────────────────────────────┬───────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Complete?        │
                    └─────────┬─────────┘
                         YES ↓ ↓ NO
                             │ │
                             │ └──────────────────┐
                             │                     ▼
                             │      ┌──────────────────────────┐
                             │      │   Constraint Wizard      │
                             │      │  • Interactive prompts   │
                             │      │  • Collects constraints  │
                             │      │  • Validates in real-time│
                             │      └──────────┬───────────────┘
                             │                 │
                             ▼                 ▼
                    ┌─────────────────────────────────────┐
                    │      Complete Requirement Spec      │
                    │  • Business constraints             │
                    │  • Technical constraints            │
                    │  • Examples & test cases            │
                    │  • Acceptance criteria              │
                    └─────────────┬───────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────────────┐
                    │      Markdown Formatter             │
                    │  • YAML frontmatter                 │
                    │  • Structured sections              │
                    │  • Code blocks                      │
                    │  • Constraint visualization         │
                    └─────────────┬───────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────────────┐
                    │   AI-Ready Specification File       │
                    │   (Markdown with complete context)  │
                    └─────────────────────────────────────┘
```

## 📋 Constraint Types

### 💼 Business Constraints
**What:** Domain rules and business logic requirements
**Examples:**
- Email must be unique
- Only premium users can access
- Data retained for 90 days
- Minimum age 18+

### ⚙️ Technical Constraints
**What:** System limitations and technology requirements
**Examples:**
- Response time < 200ms
- Passwords hashed with bcrypt
- API returns proper status codes
- Supports Chrome 90+

## 🎨 Requirement Types

### 1. **API Endpoint** (`api-endpoint`)
For REST API endpoints
- Request/response schemas
- Authentication
- Validation rules
- Status codes
- Rate limiting

### 2. **Database Entity** (`entity`)
For database models
- Field definitions
- Data types & constraints
- Relationships
- Indexes
- Validation

### 3. **Feature** (`feature`)
Complete features
- User stories
- Workflows
- Business rules
- Success criteria
- Scope

### 4. **Bug Fix** (`bug-fix`)
For fixing bugs
- Current vs expected behavior
- Root cause
- Reproduction steps
- Fix approach
- Tests

### 5. **Refactoring** (`refactoring`)
Code improvements
- Current state
- Desired state
- Breaking changes
- Migration path
- Impact

## 🎯 Constraint Severity

- 🔴 **MANDATORY** - MUST be satisfied (hard requirement)
- 🟡 **RECOMMENDED** - SHOULD be satisfied (soft requirement)
- 🟢 **OPTIONAL** - COULD be satisfied (nice to have)

## ✍️ Writing Good Constraints

### ✅ DO
```
✓ "API response time must be under 200ms for 95th percentile"
✓ "Email must be unique across all active users"
✓ "Password must contain 8+ characters, 1 uppercase, 1 number"
✓ "Account locked for 15 minutes after 5 failed attempts"
```

### ❌ DON'T
```
✗ "Should be fast"
✗ "Good performance"
✗ "Reasonable security"
✗ "Works well"
```

## 📄 Output Format

The system generates **Structured Markdown**:

```markdown
---
id: API_ENDPOINT_xyz123
type: api-endpoint
title: User Login API
domain: backend
priority: high
tags: [auth, security]
---

## Context
**Problem:** Users need to authenticate...

## Business Constraints
### BC001 🔴 [MANDATORY]
**Rule:** Email and password must both be provided
**Rationale:** Required for authentication

### BC002 🔴 [MANDATORY]
**Rule:** Account locked after 5 failed attempts
**Rationale:** Prevents brute force attacks

## Technical Constraints
### TC001 🔴 [MANDATORY]
**Rule:** Response time under 300ms for 95th percentile
**Rationale:** User experience requirement

### TC002 🔴 [MANDATORY]
**Rule:** Returns 401 for invalid, 200 for success
**Rationale:** HTTP semantics

## Acceptance Criteria
### Criterion 1
- **Given:** Valid credentials
- **When:** User submits login
- **Then:** Returns 200 with auth token

## Examples
### Valid Login
**Input:**
\`\`\`json
{"email": "user@example.com", "password": "Pass123!"}
\`\`\`
**Expected:** 200 OK with JWT token
```

## 🚀 Usage Flow

### 1. **Create Requirement**
```bash
vibespec parse "Create user login API" \
  --type api-endpoint \
  --interactive
```

### 2. **Wizard Launches**
```
🧙 Constraint Wizard
Requirements need clear constraints for AI code generation.

💡 Example constraints for api-endpoint:
...

💼 Business Constraints
? Add business constraints? Yes
? Constraint rule: Email and password must both be provided
? Severity: Mandatory
✓ Added constraint: BC001
```

### 3. **Spec Generated**
```
📋 Generated: user-login-api-endpoint.md

✅ Complete specification with:
   • 3 business constraints
   • 4 technical constraints
   • 5 acceptance criteria
   • 4 examples
   • API contract
```

### 4. **Use with AI**
```bash
# Copy spec to AI tool
cat user-login-api-endpoint.md

# Or paste into GitHub Copilot, Claude, ChatGPT, etc.
```

## 🎓 Key Concepts

### 1. **Constraints are Mandatory**
Every requirement MUST have both business and technical constraints. The system validates this.

### 2. **Quality Over Quantity**
2-3 specific constraints are better than 10 vague ones. The validator checks for vagueness.

### 3. **Imperative Language**
Constraints use "must", "should", "cannot" - not descriptive language. The wizard validates this.

### 4. **Testable Criteria**
Every constraint should be verifiable. The system encourages examples.

### 5. **Context Matters**
Constraints include rationale - why they exist. This helps AI understand intent.

## 📊 Quality Metrics

The system validates:
- ✅ Has both business and technical constraints
- ✅ Uses imperative language (must/should/cannot)
- ✅ No vague terms (good/better/reasonable)
- ✅ Severity defined (mandatory/recommended/optional)
- ✅ Minimum length (10+ characters)
- ✅ Specificity (measurable criteria)

## 🔧 Technical Details

### Built With
- TypeScript (strict mode)
- Inquirer (interactive prompts)
- Chalk (colored output)
- js-yaml (YAML frontmatter)

### Architecture
- Singleton pattern for efficiency
- Template-based generation
- Validation pipeline
- Format agnostic core

### Files
```
src/
├── types/requirement-spec.ts      (400 lines)
├── core/templates.ts              (300 lines)
├── core/constraint-validator.ts   (250 lines)
├── core/constraint-wizard.ts      (350 lines)
└── core/markdown-formatter.ts     (400 lines)
```

### Documentation
```
REQUIREMENTS_SYSTEM.md            (4,500 lines)
QUICK_START_CONSTRAINTS.md        (400 lines)
IMPLEMENTATION_SUMMARY.md         (500 lines)
examples/api-endpoint-example.md  (300 lines)
examples/entity-example.md        (350 lines)
```

## 🎯 Benefits

### For Developers
- 📝 Clear requirements
- 🔍 No ambiguity
- 📋 Consistent format
- ✅ Easy validation

### For AI Code Generation
- 🎯 Complete context
- 📏 Clear rules
- 🧪 Testable criteria
- 💡 Concrete examples

### For Teams
- 🔄 Standardization
- 📚 Documentation
- 🔍 Reviewability
- 📊 Traceability

## 📈 Success Metrics

Good spec has:
- ✅ 2-3+ business constraints
- ✅ 2-3+ technical constraints
- ✅ 3-5 acceptance criteria
- ✅ 2-4 examples (including edge cases)
- ✅ Clear context and rationale
- ✅ All constraints have severity
- ✅ No vague language

## 🔗 Related Documentation

1. **Quick Start** → `QUICK_START_CONSTRAINTS.md`
2. **Complete Guide** → `REQUIREMENTS_SYSTEM.md`
3. **Implementation** → `IMPLEMENTATION_SUMMARY.md`
4. **Examples** → `examples/` directory

## 💡 Philosophy

> "Constraints aren't restrictions - they're guidance. They tell AI what 'correct' means for your specific context."

Good requirements answer:
- ✅ **What** to build (context, scope)
- ✅ **Why** it matters (problem, rationale)
- ✅ **Rules** to follow (constraints)
- ✅ **Success** criteria (acceptance)
- ✅ **Examples** to clarify (edge cases)

## 🎉 Result

With this system, you can generate requirements that:
1. Are complete and unambiguous
2. Separate business and technical concerns
3. Validate quality automatically
4. Guide AI to generate correct code
5. Are consistent and maintainable
6. Are human-readable and machine-parseable

**Your CLI now produces production-ready requirement specifications for AI code generation! 🚀**
