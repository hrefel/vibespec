# VibeSpec Requirements System

## Overview

VibeSpec CLI generates **AI-ready requirements** that are robust, clean, and easy to read by both humans and AI code generation tools. The system ensures requirements are complete with proper **business and technical constraints** before generating specification files.

## Why Constraints Matter

When generating code with AI, **constraints are mandatory** because they define:

1. **Business Constraints** - Domain rules and business logic requirements
   - Authentication rules
   - Data policies
   - User permissions
   - Business workflows

2. **Technical Constraints** - System limitations and technology requirements
   - Performance targets
   - Platform compatibility
   - API specifications
   - Security requirements

Without clear constraints, AI-generated code may:
- ❌ Violate business rules
- ❌ Ignore performance requirements
- ❌ Miss security considerations
- ❌ Implement incorrect validation logic

## Requirement Types

VibeSpec supports 5 requirement types, each with specialized templates:

### 1. API Endpoint (`api-endpoint`)
For creating or modifying API endpoints.

**Focus areas:**
- Endpoint path and HTTP method
- Request/response schemas
- Authentication requirements
- Validation rules
- Error handling
- Status codes

**Required sections:**
- Context
- API Contract
- Business Constraints
- Technical Constraints
- Validation Rules
- Acceptance Criteria
- Examples

### 2. Database Entity (`entity`)
For database models and schemas.

**Focus areas:**
- Entity fields and data types
- Relationships between entities
- Constraints (unique, required, default)
- Indexes for performance
- Validation rules

**Required sections:**
- Context
- Entities
- Business Constraints
- Technical Constraints
- Validation Rules
- Examples

### 3. Feature (`feature`)
Complete feature specification with user stories.

**Focus areas:**
- User needs and workflows
- Business rules
- User stories (actor/action/outcome)
- Success criteria
- Scope definition

**Required sections:**
- Context
- Scope
- User Stories
- Business Constraints
- Technical Constraints
- Acceptance Criteria
- Examples

### 4. Bug Fix (`bug-fix`)
Specification for fixing bugs and issues.

**Focus areas:**
- Current vs expected behavior
- Root cause analysis
- Reproduction steps
- Fix approach
- Regression tests

**Required sections:**
- Context
- Bug Details
- Business Constraints
- Technical Constraints
- Acceptance Criteria
- Examples

### 5. Refactoring (`refactoring`)
For code refactoring and improvements.

**Focus areas:**
- Why refactoring is needed
- What will change
- Breaking changes
- Migration strategy
- Performance impact

**Required sections:**
- Context
- Refactoring Details
- Business Constraints
- Technical Constraints
- Acceptance Criteria

## Output Format

VibeSpec generates **Structured Markdown** with YAML frontmatter. This format is:

✅ Easy for humans to read and write
✅ Easy for AI to parse and understand
✅ Git-friendly for version control
✅ Supports code blocks and examples
✅ Includes metadata for tracking

### Example Output Structure

```markdown
---
id: REQ-001
type: api-endpoint
title: User Registration API
domain: backend
priority: high
tags: [auth, api]
metadata:
  spec_version: 1.0.0
  generated_by: vibespec-cli
  constraints_complete: true
---

## Context
**Problem:** Users need to create accounts...

## Business Constraints
### BC001 🔴 [MANDATORY]
**Rule:** Email must be unique across all users
**Rationale:** Prevents duplicate accounts...

## Technical Constraints
### TC001 🔴 [MANDATORY]
**Rule:** Response time must be < 500ms for 95th percentile
**Rationale:** Ensures good user experience...

## Acceptance Criteria
### Criterion 1
- **Given:** Valid email and password
- **When:** User submits registration
- **Then:** Account is created with 201 status

## Examples
### Valid Registration
**Input:**
\`\`\`json
{"email": "user@example.com", "password": "Secure123!"}
\`\`\`
**Expected Behavior:** Account created successfully
```

## Constraint System

### Constraint Structure

Each constraint has:
- **ID**: Unique identifier (BC001, TC001, etc.)
- **Type**: business, technical, security, performance, data, ui-ux, regulatory
- **Rule**: Clear statement of the constraint
- **Severity**: mandatory, recommended, optional
- **Rationale**: Why this constraint exists (optional)
- **Examples**: Compliance/violation examples (optional)

### Severity Levels

- 🔴 **MANDATORY** - MUST be satisfied (hard requirement)
- 🟡 **RECOMMENDED** - SHOULD be satisfied (soft requirement)
- 🟢 **OPTIONAL** - COULD be satisfied (nice to have)

### Constraint Quality Rules

Good constraints are:
1. **Specific** - Use measurable criteria, avoid vague terms
2. **Imperative** - Use must/should/cannot language
3. **Testable** - Can be verified through testing
4. **Clear** - No ambiguity about compliance

❌ Bad: "Performance should be good"
✅ Good: "API response time must be under 200ms for 95th percentile"

## Constraint Wizard

### When is the Wizard Triggered?

The constraint wizard launches automatically when:

1. **No constraints defined** - Raw input has no business or technical constraints
2. **Incomplete constraints** - Only one constraint type present
3. **Low constraint count** - Critical requirement types (API, Entity) have < 2 constraints
4. **Vague constraints** - Detected constraints lack specificity

### Wizard Flow

```
Raw Input → Heuristic Parse → Constraint Check
                                      ↓
                           Missing/Incomplete?
                                   ↙    ↘
                                YES     NO
                                 ↓       ↓
                         Constraint   Direct
                           Wizard    Output
                              ↓
                    1. Analyze Raw Input
                    2. Show Detected Constraints
                    3. Show Examples for Type
                    4. Collect Business Constraints
                       - Enter constraint rule
                       - Select severity
                       - Add rationale (optional)
                       - Add examples (optional)
                    5. Collect Technical Constraints
                       (same process)
                    6. Review & Confirm
                    7. Generate Spec
```

### Interactive Constraint Collection

For each constraint, the wizard prompts:

1. **Rule** - What is the constraint?
   - Must be > 10 characters
   - Must use imperative language (must/should/cannot)
   - Validates for specificity

2. **Severity** - How critical is it?
   - Mandatory (MUST comply)
   - Recommended (SHOULD comply)
   - Optional (COULD comply)

3. **Rationale** (optional) - Why does this constraint exist?
   - Helps AI understand context
   - Documents decision reasoning

4. **Examples** (optional) - What does compliance/violation look like?
   - Concrete examples improve AI understanding
   - Shows edge cases

## Usage Examples

### Example 1: Create API Endpoint Requirement

```bash
vibespec parse "Create a user registration API endpoint with email and password" \
  --type api-endpoint \
  --interactive
```

**Wizard detects missing constraints and prompts:**

```
🧙 Constraint Wizard
Requirements need clear constraints for AI to generate correct code.

💡 Example constraints for api-endpoint:

Business constraints:
  • Only authenticated users can access this endpoint
  • Response must include pagination for lists > 100 items
  • Rate limit: 100 requests per minute per user

Technical constraints:
  • Response time must be < 200ms for 95th percentile
  • Endpoint must be idempotent (for POST/PUT)
  • Must return proper HTTP status codes (200, 400, 401, 404, 500)

💼 Business Constraints

? Add business constraints? Yes
? Constraint rule: Email must be unique across all users
? Severity: Mandatory - MUST be satisfied
? Add rationale? Yes
? Rationale: Prevents duplicate accounts and ensures email as primary identifier
✓ Added constraint: BC001

? Add another business constraint? Yes
? Constraint rule: Password must be at least 8 characters with uppercase, number, and special character
? Severity: Mandatory - MUST be satisfied
✓ Added constraint: BC002

⚙️ Technical Constraints

? Add technical constraints? Yes
? Constraint rule: API response time must be under 500ms for 95th percentile
? Severity: Mandatory - MUST be satisfied
✓ Added constraint: TC001
```

### Example 2: Create Database Entity

```bash
vibespec parse requirements/user-entity.txt \
  --type entity \
  --output specs/user-entity.md
```

If constraints are unclear, wizard launches and guides through:
- Entity field definitions
- Data integrity constraints (unique, required, format)
- Performance constraints (indexes, query optimization)
- Business rules (soft delete, audit trails, etc.)

### Example 3: Non-Interactive Mode

```bash
# Pre-defined constraints in input file
vibespec parse detailed-requirements.txt \
  --type feature \
  --output specs/feature.md
```

If input file already has clear constraints, wizard is skipped.

## Best Practices

### For Writing Requirements

1. **Be Specific**
   - ❌ "Should be fast"
   - ✅ "Response time must be < 200ms for 95th percentile"

2. **Include Examples**
   - Show valid and invalid inputs
   - Demonstrate edge cases
   - Clarify ambiguous scenarios

3. **Separate Concerns**
   - Business constraints = domain rules
   - Technical constraints = system limitations
   - Don't mix them

4. **Use Given/When/Then**
   - Clear acceptance criteria format
   - Easy for AI to understand test cases
   - Follows BDD conventions

5. **Define Data Models Clearly**
   - Specify types, constraints, defaults
   - Document relationships
   - Indicate required indexes

### For AI Code Generation

Generated specs are optimized for AI by including:

- ✅ **Context** - Why this requirement exists
- ✅ **Constraints** - What rules must be followed
- ✅ **Examples** - Concrete input/output samples
- ✅ **Acceptance Criteria** - Testable conditions
- ✅ **API Contracts** - Explicit interfaces
- ✅ **Validation Rules** - Clear data validation
- ✅ **AI Guidance** - Implementation hints

## Advanced Features

### Constraint Suggestions

The system analyzes raw input and suggests likely constraints:

```
📝 Detected potential constraints:

Business constraints:
  • Users must be authenticated
  • Email must be unique

Technical constraints:
  • Response time under 500ms
  • Must support pagination
```

### Constraint Validation

Each constraint is validated for quality:
- ✓ Has imperative language
- ✓ Is specific (no vague terms)
- ✓ Has proper severity
- ✓ Is testable

### Template-Based Generation

Each requirement type gets specialized structure:
- Pre-defined sections
- Type-specific examples
- Relevant constraint categories
- Appropriate validation rules

## Integration with AI Tools

Generated specs work seamlessly with:

- **GitHub Copilot** - Clear context for code suggestions
- **Claude/ChatGPT** - Structured input for code generation
- **Cursor** - Enhanced understanding of requirements
- **v0.dev** - Component generation from specs
- **Bolt.new** - Full-stack app generation

### Example AI Prompt

```markdown
Generate TypeScript code for this requirement:

[paste generated spec here]

Follow all MANDATORY constraints and implement the API contract exactly as specified.
Include unit tests for acceptance criteria.
```

The AI will have complete context including:
- What to build (context & scope)
- Rules to follow (constraints)
- How to validate (examples & acceptance criteria)
- What success looks like (test cases)

## File Organization

```
project/
├── requirements/           # Raw input files
│   ├── user-registration.txt
│   └── user-profile.txt
├── specs/                 # Generated specs
│   ├── api-endpoint/
│   │   └── user-registration.md
│   ├── entity/
│   │   └── user.md
│   └── feature/
│       └── user-profile.md
└── vibes.config.json     # CLI configuration
```

## Summary

VibeSpec's constraint-focused approach ensures:

1. ✅ **Complete Requirements** - No missing business or technical rules
2. ✅ **AI-Ready Output** - Structured, clear, machine-parseable
3. ✅ **Quality Assurance** - Validation catches vague or incomplete constraints
4. ✅ **Consistency** - Templates ensure uniform structure
5. ✅ **Traceability** - Metadata tracks how specs were generated

**Result:** Requirements that guide AI to generate correct, compliant, production-ready code.

## Next Steps

1. Try the examples in `/examples` directory
2. Run `vibespec parse --interactive` to experience the wizard
3. Generate your first spec with constraint validation
4. Use generated specs with your favorite AI code generation tool
5. Iterate based on code generation results

For more information, see:
- [Getting Started Guide](./GETTING_STARTED.md)
- [README](./README.md)
- [API Documentation](./docs/api.md)
