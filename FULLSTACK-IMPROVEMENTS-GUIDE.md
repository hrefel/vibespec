# VibeSpec Fullstack Improvements Guide

## 🎯 Problem Solved

**Before**: Generated specs were too vague, causing frontend-backend synchronization bugs:
- Field name mismatches (`priority` vs `priorityLevel`)
- Data type confusion (`1` vs `"low"` for enums)
- Date format inconsistencies (Unix timestamps vs ISO 8601)
- Missing validation rules
- No type definitions

**After**: Specs now include precise type definitions, API contracts, and data mapping to eliminate sync bugs.

---

## ✨ What's New

### 1. Enhanced Type Definitions (src/types/spec.ts)

New interfaces added to `VibeSpec`:

```typescript
interface VibeSpec {
  // ... existing fields ...

  // NEW: Complete entity definitions with validation
  entities?: EntityDefinition[];

  // NEW: Detailed API endpoint contracts
  api_endpoints?: APIContract[];

  // NEW: Data transformation rules
  data_mapping?: DataMapping;

  // NEW: TypeScript type definitions for frontend/backend
  type_definitions?: TypeDefinitions;

  // NEW: Structured AI guidance
  ai_guidance?: string | EnhancedAIGuidance;
}
```

### 2. Domain-Specific Prompts (src/core/fullstack-prompts.ts)

AI models now receive detailed prompts that explicitly request:

#### For Fullstack Domain:
- Complete entity definitions with all fields
- Exact data types (not generic "string")
- API endpoints with request/response schemas
- Validation rules for every input field
- Data mapping configuration (snake_case ↔ camelCase)
- TypeScript type definitions
- Enhanced AI guidance with 8+ specific sections

#### For Backend Domain:
- Entity definitions
- API contracts with validation
- Database schemas
- Security and performance guidance

#### For Frontend Domain:
- TypeScript interfaces
- Form validation rules
- Component specifications
- Accessibility guidance

### 3. Pre-built Templates (src/core/fullstack-templates.ts)

Ready-to-use templates for common patterns:

#### CRUD Template
```typescript
generateCRUDTemplate('Task', [...fields])
```
Generates:
- Complete CRUD entity definition
- 5 API endpoints: Create, Read All, Read One, Update, Delete
- Data mapping configuration
- TypeScript interfaces
- Database schema
- AI guidance

#### Auth Template
```typescript
generateAuthTemplate()
```
Generates:
- User entity with password hashing
- 5 auth endpoints: Register, Login, Refresh, Get Profile, Logout
- JWT configuration
- Refresh token management
- Security best practices

---

## 🚀 How to Use

### Method 1: Automatic Enhancement (Recommended)

Just use the CLI as normal. The enhanced prompts are automatically applied for `fullstack` and `backend` domains:

```bash
vibespec generate "Create a task management API with user authentication. Tasks should have title, description, priority (low/medium/high), and status (todo/in_progress/completed)."
```

**The AI will now automatically generate**:
- ✅ Complete `Task` entity with all fields typed
- ✅ CRUD API endpoints with request/response schemas
- ✅ Validation rules for each field
- ✅ Data mapping (database ↔ API ↔ frontend)
- ✅ TypeScript type definitions
- ✅ Enhanced AI guidance

### Method 2: Using Templates Programmatically

If you're building on top of VibeSpec:

```typescript
import { generateCRUDTemplate, generateAuthTemplate } from './src/core/fullstack-templates';

// Generate CRUD template for Product entity
const productSpec = generateCRUDTemplate('Product', [
  { name: 'id', type: 'uuid', required: true, unique: true },
  { name: 'name', type: 'string', required: true, min_length: 1, max_length: 200 },
  { name: 'price', type: 'number', required: true, min_value: 0 },
  { name: 'inStock', type: 'boolean', required: true, default: true }
]);

// Generate auth system
const authSpec = generateAuthTemplate();

// Combine them
const fullSpec = {
  title: 'E-commerce API',
  domain: 'fullstack',
  ...productSpec,
  entities: [...(authSpec.entities || []), ...(productSpec.entities || [])],
  api_endpoints: [...(authSpec.api_endpoints || []), ...(productSpec.api_endpoints || [])]
};
```

---

## 📊 Comparison: Before vs After

### Before (v6.0.0 and earlier)

```json
{
  "title": "Task Management System",
  "domain": "fullstack",
  "requirements": [
    "Create tasks",
    "Tasks have priority levels"
  ],
  "components": ["Task Component"],
  "ai_guidance": "Use React and Node.js"
}
```

**Problems**:
- ❌ No definition of what "priority levels" means
- ❌ No API endpoint specifications
- ❌ No data types
- ❌ Backend might send `priority: 1`, frontend expects `priority: "high"`
- ❌ Leads to bugs in generated code

### After (v6.1.1)

```json
{
  "title": "Task Management System",
  "domain": "fullstack",
  "entities": [
    {
      "name": "Task",
      "fields": [
        {
          "name": "priority",
          "type": "enum",
          "enum_values": ["low", "medium", "high"],
          "required": true,
          "default": "medium"
        }
      ]
    }
  ],
  "api_endpoints": [
    {
      "name": "Create Task",
      "method": "POST",
      "endpoint": "/api/tasks",
      "request": {
        "body": {
          "priority": {
            "type": "enum",
            "enum_values": ["low", "medium", "high"],
            "required": true
          }
        }
      },
      "responses": [
        {
          "status": 201,
          "body": {
            "priority": "low | medium | high"
          }
        }
      ],
      "validation_rules": [
        {
          "field": "priority",
          "rules": ["required", "in:low,medium,high"]
        }
      ]
    }
  ],
  "type_definitions": {
    "frontend": {
      "TaskPriority": "type TaskPriority = 'low' | 'medium' | 'high'",
      "Task": "interface Task { priority: TaskPriority; }"
    }
  },
  "data_mapping": {
    "naming_convention": {
      "database": "snake_case",
      "api": "camelCase",
      "frontend": "camelCase"
    }
  },
  "ai_guidance": {
    "type_safety": "Use TaskPriority type on both frontend and backend",
    "validation": "Validate priority field with enum check on both sides",
    "error_handling": "Return 400 with field-level errors if priority is invalid"
  }
}
```

**Benefits**:
- ✅ Exact definition: `priority` is enum with values `["low", "medium", "high"]`
- ✅ Both frontend and backend know to use strings, not numbers
- ✅ TypeScript type: `type TaskPriority = 'low' | 'medium' | 'high'`
- ✅ Validation rules specified for both sides
- ✅ Zero synchronization bugs!

---

## 🎯 Use Cases & Examples

### Use Case 1: E-commerce Product Management

```bash
vibespec generate "Build a product catalog API. Products have name, description, price (decimal), SKU (unique string), category (enum: electronics/clothing/home), inStock (boolean), and images (array of URLs). Support CRUD operations with pagination."
```

**You'll get**:
- `Product` entity with exact field types
- All CRUD endpoints with schemas
- Pagination configuration
- TypeScript interfaces
- Database schema with constraints
- Validation rules (price > 0, SKU unique, etc.)

### Use Case 2: Blog Platform

```bash
vibespec generate "Create a blog system with posts and comments. Posts have title, content (markdown), author (relation to user), status (draft/published), publishedAt (date). Comments belong to posts and users. Include authentication."
```

**You'll get**:
- `Post` and `Comment` entities with relationships
- Auth system (User entity + JWT endpoints)
- CRUD for posts and comments
- Proper foreign key relationships
- Date handling specification
- Markdown validation

### Use Case 3: Real-time Chat

```bash
vibespec generate "Build a real-time chat API. Messages have text, sender (user), room (string), timestamp, attachments (optional array). Support WebSocket for real-time updates."
```

**You'll get**:
- `Message` entity with proper types
- REST API for message history
- WebSocket event specifications
- Real-time update guidance
- Timestamp handling in ISO 8601

---

## 🔧 Configuration & Customization

### Adjusting Prompt Behavior

Edit `src/core/fullstack-prompts.ts` to customize prompts:

```typescript
// Add more emphasis on security
export function buildFullstackPrompt(input: string, heuristic: HeuristicOutput): string {
  return `...

CRITICAL REQUIREMENTS:
1. For EVERY entity, create complete field definitions
2. For EVERY CRUD operation, create API endpoints
3. Add input sanitization for all string fields  // <- Add this
4. Implement rate limiting on auth endpoints      // <- Add this
...`;
}
```

### Adding New Templates

Add to `src/core/fullstack-templates.ts`:

```typescript
/**
 * File Upload Template
 */
export function generateFileUploadTemplate(): Partial<VibeSpec> {
  return {
    entities: [{
      name: 'Upload',
      fields: [
        { name: 'id', type: 'uuid', required: true, unique: true },
        { name: 'fileName', type: 'string', required: true },
        { name: 'fileSize', type: 'number', required: true },
        { name: 'mimeType', type: 'string', required: true },
        { name: 'url', type: 'string', required: true },
        { name: 'uploadedBy', type: 'uuid', required: true }
      ]
    }],
    api_endpoints: [
      {
        name: 'Upload File',
        method: 'POST',
        endpoint: '/api/uploads',
        request: {
          headers: { 'Content-Type': 'multipart/form-data' },
          body: { file: { type: 'file', required: true, max_size: '10MB' } }
        },
        responses: [
          { status: 201, body: { id: 'uuid', url: 'string', fileName: 'string' } }
        ]
      }
    ],
    ai_guidance: {
      security: 'Validate file types, scan for viruses, limit file size',
      storage: 'Use AWS S3 or similar object storage, generate signed URLs'
    }
  };
}
```

---

## 🧪 Testing Your Specs

### 1. Generate a Test Spec

```bash
vibespec generate "Create a simple todo API with tasks that have title and completed status" --output test-spec.json
```

### 2. Verify Required Fields

Check that your spec includes:
- ✅ `entities` array with complete field definitions
- ✅ `api_endpoints` array with request/response schemas
- ✅ `data_mapping` configuration
- ✅ `type_definitions` for TypeScript
- ✅ `ai_guidance` as an object (not just string)

### 3. Validate Type Consistency

Ensure:
- Field names match across entity, API endpoints, and type definitions
- Enum values are consistent (e.g., `"low"` not `"LOW"` or `1`)
- Date fields use ISO 8601 format
- Validation rules match between frontend and backend

### 4. Example Validation Script

```typescript
import { VibeSpec } from './src/types';

function validateSpec(spec: VibeSpec): string[] {
  const errors: string[] = [];

  // Check entities exist
  if (!spec.entities || spec.entities.length === 0) {
    errors.push('Missing entities');
  }

  // Check API endpoints exist
  if (!spec.api_endpoints || spec.api_endpoints.length === 0) {
    errors.push('Missing API endpoints');
  }

  // Check data mapping
  if (!spec.data_mapping) {
    errors.push('Missing data_mapping configuration');
  }

  // Check type definitions
  if (!spec.type_definitions?.frontend) {
    errors.push('Missing frontend type definitions');
  }

  // Check AI guidance is structured
  if (typeof spec.ai_guidance === 'string') {
    errors.push('AI guidance should be an object, not a string');
  }

  return errors;
}
```

---

## 🐛 Troubleshooting

### Issue 1: AI Not Generating Entities

**Problem**: Generated spec has no `entities` field.

**Solution**:
- Make sure you're using domain `fullstack` or `backend`
- Use clearer entity descriptions in your input:
  - ✅ "Create a Task entity with title, description, and priority fields"
  - ❌ "Make a task system"

### Issue 2: Incomplete API Contracts

**Problem**: API endpoints missing request/response schemas.

**Solution**:
- Check `max_tokens` is set to 4000 (done in v6.1.1)
- Use a more capable model (GPT-4, Claude-3, etc.)
- Be more specific about CRUD operations:
  - ✅ "Support creating, reading, updating, and deleting tasks"
  - ❌ "Task management"

### Issue 3: Type Definitions Not Generated

**Problem**: `type_definitions` field is empty.

**Solution**:
- Mention TypeScript explicitly: "Use TypeScript for type safety"
- The enhanced prompts should handle this automatically for fullstack/backend domains
- Verify you're using v6.1.1 or later

### Issue 4: Field Name Inconsistencies

**Problem**: Database uses `due_date` but frontend expects `dueDate`.

**Solution**:
- The new `data_mapping.transformations` field should handle this
- Verify the transformation rules are present in the spec
- Implement a field mapper in your API middleware:

```typescript
function toAPI(dbRecord: any): any {
  return {
    dueDate: dbRecord.due_date,
    createdAt: dbRecord.created_at,
    // ...
  };
}
```

---

## 📈 Best Practices

### 1. Be Specific in Requirements

**Bad**:
```
"Build a user system"
```

**Good**:
```
"Build a user authentication system with:
- User registration (email, password, name)
- Login with JWT tokens
- Password must be 8+ characters with uppercase, lowercase, and number
- Email must be unique
- Support token refresh"
```

### 2. Specify Data Types

**Bad**:
```
"Tasks have priority"
```

**Good**:
```
"Tasks have priority field with enum values: low, medium, high"
```

### 3. Mention Relationships

**Bad**:
```
"Comments and posts"
```

**Good**:
```
"Comments belong to posts (many-to-one relationship). Each comment has a foreign key to the post."
```

### 4. Include Validation Rules

**Bad**:
```
"Tasks have titles"
```

**Good**:
```
"Tasks have title field (required, string, 1-200 characters)"
```

### 5. Specify Tech Stack

**Bad**:
```
"Use modern stack"
```

**Good**:
```
"Use React with TypeScript, Node.js with Express, PostgreSQL database, JWT authentication"
```

---

## 🎓 Next Steps

### 1. Test with Real Projects

Generate specs for your actual projects and see how they improve code generation quality.

### 2. Build Code Generators

Create tools that consume these enhanced specs to generate:
- TypeScript interfaces
- API clients
- Database migrations
- Validation schemas
- Mock data generators

### 3. Contribute Templates

Add more templates for common patterns:
- Search/filtering
- File uploads
- Real-time (WebSocket/SSE)
- Pagination
- Rate limiting
- Caching strategies

### 4. Integration

Integrate with:
- Code generation tools (Cursor, GitHub Copilot)
- API documentation tools (Swagger/OpenAPI)
- Database migration tools (Prisma, TypeORM)
- Testing frameworks

---

## 📚 Reference

### File Structure

```
src/
├── types/
│   └── spec.ts                    # Enhanced type definitions
├── core/
│   ├── ai-adapters.ts            # Updated adapters using new prompts
│   ├── fullstack-prompts.ts      # NEW: Domain-specific prompts
│   └── fullstack-templates.ts    # NEW: Pre-built templates
└── ...

examples/
├── IMPROVED-task-management.json  # NEW: Example of enhanced spec
└── ...
```

### Key Types

```typescript
// Entity definition
interface EntityDefinition {
  name: string;
  fields: EntityField[];
  relationships?: EntityRelationship[];
  indexes?: string[];
}

// API contract
interface APIContract {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  authentication?: string;
  request?: { body?: any; query_params?: any; path_params?: any };
  responses: APIResponse[];
  validation_rules?: ValidationRule[];
}

// Data mapping
interface DataMapping {
  naming_convention?: {
    database?: string;    // snake_case
    api?: string;         // camelCase
    frontend?: string;    // camelCase
  };
  date_handling?: {...};
  transformations?: {...}[];
}
```

---

## 🤝 Support

- **Issues**: https://github.com/your-repo/vibespec-cli/issues
- **Discussions**: https://github.com/your-repo/vibespec-cli/discussions
- **Documentation**: https://docs.vibespec.dev (if available)

---

## 📄 License

MIT License - See LICENSE file for details.
