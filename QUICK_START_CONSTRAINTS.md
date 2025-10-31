# Quick Start: Writing Requirements with Constraints

## TL;DR

VibeSpec CLI helps you write AI-ready requirements. **Constraints are mandatory** - they tell AI what rules to follow when generating code.

## Two Types of Constraints

### 1. Business Constraints 💼
Domain rules and business logic requirements

**Examples:**
- ✅ "Email must be unique across all users"
- ✅ "Only premium users can access this feature"
- ✅ "Data must be retained for 90 days"
- ✅ "Users must be 18+ years old"

### 2. Technical Constraints ⚙️
System limitations and technology requirements

**Examples:**
- ✅ "Response time must be < 200ms for 95th percentile"
- ✅ "API must return HTTP status code 401 for unauthorized access"
- ✅ "Passwords must be hashed using bcrypt with 10+ salt rounds"
- ✅ "Must support Chrome 90+, Firefox 88+, Safari 14+"

## Quick Examples

### Example 1: Simple API Endpoint

**Raw Input:**
```
Create a login endpoint that accepts email and password
```

**After Constraint Wizard:**

Business Constraints:
- BC001: Email and password must both be provided
- BC002: Account must be locked after 5 failed attempts

Technical Constraints:
- TC001: Response time must be under 300ms
- TC002: Must return 401 for invalid credentials, 200 for success

### Example 2: Database Entity

**Raw Input:**
```
User table with email, password, and profile fields
```

**After Constraint Wizard:**

Business Constraints:
- BC001: Email must be unique
- BC002: Soft delete required (no hard deletes)

Technical Constraints:
- TC001: Primary key must be UUID v4
- TC002: All timestamps in UTC
- TC003: Email field needs unique index

## Writing Good Constraints

### ✅ DO

- Be specific: "Response time < 200ms" not "should be fast"
- Use imperative: "must", "should", "cannot"
- Make testable: Can you verify compliance?
- Include rationale: Why does this constraint exist?

### ❌ DON'T

- Be vague: "performance should be good"
- Be ambiguous: "reasonably fast"
- Mix concerns: Keep business and technical separate
- Skip severity: Mark as mandatory/recommended/optional

## Severity Levels

- 🔴 **MANDATORY** - MUST comply (breaks if violated)
- 🟡 **RECOMMENDED** - SHOULD comply (degraded if violated)
- 🟢 **OPTIONAL** - COULD comply (nice to have)

## CLI Usage

### Interactive Mode (Recommended)
```bash
vibespec parse "your requirement" --interactive
```

The wizard will:
1. Analyze your input
2. Detect potential constraints
3. Show examples for your requirement type
4. Guide you through adding business constraints
5. Guide you through adding technical constraints
6. Generate complete spec

### Non-Interactive Mode
```bash
vibespec parse requirements.txt --output spec.md
```

If constraints are unclear, wizard launches automatically.

## Output Format

```markdown
---
id: REQ-001
type: api-endpoint
title: User Login
---

## Business Constraints

### BC001 🔴 [MANDATORY]
**Rule:** Email and password must both be provided
**Rationale:** Both are required for authentication

### BC002 🔴 [MANDATORY]
**Rule:** Account locked for 15 minutes after 5 failed attempts
**Rationale:** Protection against brute force attacks

## Technical Constraints

### TC001 🔴 [MANDATORY]
**Rule:** Response time must be under 300ms for 95th percentile
**Rationale:** User experience requirement

### TC002 🔴 [MANDATORY]
**Rule:** Return 401 for invalid credentials, 200 for success
**Rationale:** Standard HTTP semantics
```

## Minimum Requirements

For AI code generation to work well:

- ✅ At least 2-3 business constraints
- ✅ At least 2-3 technical constraints
- ✅ Clear examples of expected behavior
- ✅ Acceptance criteria (Given/When/Then)

## Common Constraint Categories

### Business Constraints
- Authentication/authorization rules
- Data validation rules
- Business workflow rules
- User permissions
- Data retention policies
- Compliance requirements

### Technical Constraints
- Performance requirements
- Security requirements
- API specifications
- Database constraints
- Platform compatibility
- Error handling
- Scalability requirements

## Tips for Success

1. **Start with "must"** - What absolutely MUST happen?
2. **Think about failure** - What CANNOT happen?
3. **Consider edge cases** - What about unusual inputs?
4. **Be measurable** - Can you test this?
5. **Add context** - Why does this constraint exist?

## Example Session

```bash
$ vibespec parse "Create user registration API" --interactive

🧙 Constraint Wizard
Requirements need clear constraints for AI to generate correct code.

💡 Example constraints for api-endpoint:

Business constraints:
  • Only authenticated users can access this endpoint
  • Response must include pagination for lists > 100 items

Technical constraints:
  • Response time must be < 200ms for 95th percentile
  • Must return proper HTTP status codes

💼 Business Constraints

? Add business constraints? Yes
? Constraint rule: Email must be unique across all users
? Severity: Mandatory
✓ Added constraint: BC001

? Add another business constraint? Yes
? Constraint rule: Password must be at least 8 characters with uppercase and number
? Severity: Mandatory
✓ Added constraint: BC002

⚙️ Technical Constraints

? Add technical constraints? Yes
? Constraint rule: API must respond within 500ms for 95th percentile
? Severity: Mandatory
✓ Added constraint: TC001

✅ Constraint collection complete!

📋 Generated: user-registration-api-endpoint.md
```

## Next Steps

1. Try interactive mode: `vibespec parse --interactive`
2. Read full guide: [REQUIREMENTS_SYSTEM.md](./REQUIREMENTS_SYSTEM.md)
3. See examples: [examples/](./examples/)
4. Use generated specs with AI code generation tools

## Remember

**Good constraints = Good AI-generated code**

Without clear constraints, AI will make assumptions that may not match your needs. Spend time on constraints upfront to save time debugging later!

## Questions?

- Read: [REQUIREMENTS_SYSTEM.md](./REQUIREMENTS_SYSTEM.md) for detailed explanation
- See: [examples/](./examples/) for complete examples
- Run: `vibespec --help` for CLI options
