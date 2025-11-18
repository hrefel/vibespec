# VibeSpec Standard Output Format v1.0.0

## Overview

This document defines the standardized JSON specification format for VibeSpec CLI outputs. This format ensures consistency across all generated specifications and enables better tooling integration.

---

## Schema Structure

### 1. Root Level Properties

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `$schema` | string | URL to the JSON schema for validation |
| `spec_version` | string | Version of the spec format (semver) |
| `title` | string | Project or application name |
| `domain` | enum | One of: `fullstack`, `frontend`, `backend`, `mobile`, `desktop` |
| `description` | string | Clear project description (1-3 sentences) |
| `requirements` | array | List of functional and non-functional requirements |
| `tech_stack` | array | Technologies, frameworks, and libraries |
| `acceptance_criteria` | array | Measurable success criteria |
| `metadata` | object | Generation metadata |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `components` | array | High-level system components |
| `architecture` | object | Module and component architecture |
| `ui_components` | object | Frontend specifications (if applicable) |
| `api_specifications` | object | API endpoint definitions |
| `database_schema` | object | Database structure |
| `state_management` | object | State management approach |
| `performance_requirements` | object | Performance targets |
| `security_requirements` | object | Security specifications |
| `testing_requirements` | object | Testing strategy |
| `deployment` | object | Deployment configuration |
| `ai_guidance` | string | Additional context for AI tools |

---

## 2. Architecture Section

### Purpose
Defines the modular structure of the application with clear boundaries and dependencies.

### Structure

```json
{
  "architecture": {
    "modules": [
      {
        "name": "authentication",
        "domain": "user-management",
        "description": "Handles user authentication and session management",
        "components": ["LoginForm", "SignupForm", "AuthProvider"],
        "routes": ["/login", "/signup", "/logout"],
        "dependencies": [],
        "api_endpoints": ["/api/auth/login", "/api/auth/signup"]
      }
    ],
    "shared_modules": {
      "design-system": ["Button", "Input", "Modal"],
      "hooks": ["useAuth", "useToast", "useDebounce"],
      "utils": ["formatDate", "validateEmail"]
    }
  }
}
```

### Module Properties

- **name**: Kebab-case module identifier
- **domain**: Business domain or feature area
- **description**: What the module does
- **components**: React/Vue/Angular components in this module
- **routes**: URL routes handled by this module
- **dependencies**: Other modules this depends on
- **api_endpoints**: Backend endpoints used by this module

---

## 3. UI Components Section

### 3.1 Design System

Defines the visual foundation of the application.

#### Breakpoints
Standard responsive breakpoints:
```json
{
  "mobile": "320px - 767px",
  "tablet": "768px - 1023px",
  "desktop": "1024px+"
}
```

#### Color Scheme
Use hex codes with named references:
```json
{
  "primary": "#2563eb (blue-600)",
  "secondary": "#64748b (slate-500)"
}
```

#### Typography
Format: `"size/line-height, font-weight: weight"`
```json
{
  "heading_h1": "32px/40px, font-weight: 700"
}
```

### 3.2 Accessibility

Mandatory accessibility standards:

```json
{
  "wcag_level": "AA",
  "color_contrast": "4.5:1 minimum for text",
  "keyboard_navigation": "All interactive elements must be keyboard accessible",
  "screen_reader": "Proper ARIA labels and semantic HTML required",
  "focus_indicators": "Visible focus states on all interactive elements"
}
```

### 3.3 Interfaces

Detailed UI specifications per feature/module.

#### Page Structure

```json
{
  "interface_name": {
    "pages": ["page1", "page2"],
    "layout": "Overall layout description",

    "page_name": {
      "layout": "Specific page layout",
      "fields": [...],
      "actions": [...],
      "loading_states": {...}
    }
  }
}
```

#### Field Specification

```json
{
  "name": "email",
  "type": "email",
  "label": "Email Address",
  "placeholder": "you@example.com",
  "validation": "Required, valid email format",
  "async_validation": "Check availability on blur (optional)",
  "error_messages": {
    "required": "Email is required",
    "invalid": "Please enter a valid email address"
  }
}
```

#### Action Specification

```json
{
  "type": "submit | button | link",
  "label": "Button text",
  "loading_state": "Loading text...",
  "disabled_when": "Condition for disabling",
  "destination": "/path (for links)",
  "action": "Action description"
}
```

### 3.4 Interaction Patterns

#### Loading States
```json
{
  "page_load": "Full page skeleton loader matching layout",
  "component_load": "Skeleton cards/shimmer effect",
  "button_action": "Spinner inside button + loading text"
}
```

#### Animations
Format: `"Animation type (duration)"`
```json
{
  "page_transitions": "Fade in (150ms)",
  "modal_open": "Fade in + scale up (200ms)"
}
```

---

## 4. API Specifications

### Endpoint Structure

```json
{
  "path": "/api/users",
  "method": "POST",
  "description": "Create a new user account",
  "authentication_required": true,
  "request": {
    "headers": {
      "Authorization": "Bearer {token}",
      "Content-Type": "application/json"
    },
    "body": {
      "email": {
        "type": "string",
        "required": true,
        "validation": "Valid email format",
        "example": "user@example.com"
      }
    }
  },
  "response": {
    "success": {
      "status": 200,
      "body": {
        "id": "User ID",
        "email": "User email"
      }
    },
    "error": {
      "status": 400,
      "body": {
        "error": "Error message"
      }
    }
  },
  "rate_limiting": "100 requests per minute"
}
```

### Standard Error Codes

Always include these standard HTTP status codes:

- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Authentication failed
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource conflict
- **422**: Unprocessable Entity - Validation failed
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error
- **503**: Service Unavailable

---

## 5. Database Schema

### Table Structure

```json
{
  "name": "users",
  "description": "Stores user account information",
  "columns": [
    {
      "name": "id",
      "type": "UUID",
      "constraints": ["PRIMARY KEY"],
      "default": "gen_random_uuid()",
      "description": "Unique user identifier"
    }
  ],
  "indexes": [
    {
      "name": "idx_users_email",
      "columns": ["email"],
      "type": "BTREE",
      "unique": true
    }
  ],
  "relationships": [
    {
      "type": "one-to-many",
      "table": "reservations",
      "foreign_key": "user_id",
      "on_delete": "CASCADE"
    }
  ]
}
```

---

## 6. State Management

### Structure

```json
{
  "strategy": "Redux | Zustand | Context API",
  "global_state": {
    "auth": {
      "state": {
        "user": "User object or null",
        "isAuthenticated": "boolean",
        "token": "JWT token string"
      },
      "actions": ["login", "logout", "refreshToken"],
      "selectors": ["selectUser", "selectIsAuthenticated"]
    }
  },
  "local_state": {
    "LoginForm": ["email", "password", "isSubmitting"]
  },
  "caching": {
    "strategy": "React Query",
    "cache_time": "5 minutes",
    "stale_time": "30 seconds"
  }
}
```

---

## 7. Requirements & Criteria

### Requirements Format

Use clear, actionable statements:

```json
{
  "requirements": [
    "User authentication with email and password",
    "Support for 500+ concurrent users",
    "Email confirmation within 10 seconds of booking"
  ]
}
```

### Acceptance Criteria Format

Make criteria measurable and testable:

```json
{
  "acceptance_criteria": [
    "95% of bookings completed successfully",
    "Average page response time under 2 seconds",
    "Users can successfully sign up and log in"
  ]
}
```

---

## 8. Metadata

### Structure

```json
{
  "metadata": {
    "spec_version": "1.0.0",
    "generated_by": "vibes-cli v6.0.0",
    "generated_at": "2025-10-31T09:05:21.370Z",
    "input_hash": "SHA-256 hash",
    "processing": {
      "provider": "openrouter | anthropic | openai",
      "model": "model-identifier",
      "heuristic_confidence": 0.75,
      "ai_refinement_applied": true,
      "cache_hit": false,
      "refinement_method": "ai | heuristic | hybrid"
    }
  }
}
```

### Processing Fields

- **provider**: AI provider used
- **model**: Specific model identifier
- **heuristic_confidence**: Confidence score (0.0-1.0)
- **ai_refinement_applied**: Whether AI refined the output
- **cache_hit**: Whether result was cached
- **refinement_method**: How the spec was refined

---

## 9. Best Practices

### Naming Conventions

1. **Modules**: kebab-case (`user-authentication`, `restaurant-search`)
2. **Components**: PascalCase (`LoginForm`, `RestaurantCard`)
3. **Routes**: lowercase with hyphens (`/forgot-password`)
4. **API Endpoints**: lowercase with hyphens (`/api/auth/login`)
5. **Database Tables**: lowercase with underscores (`user_accounts`)
6. **Database Columns**: lowercase with underscores (`created_at`)

### Consistency Guidelines

1. **Always include** design system when domain is `fullstack` or `frontend`
2. **Always include** API specs when domain is `fullstack` or `backend`
3. **Always include** accessibility requirements for UI
4. **Use ISO 8601** for all timestamps
5. **Use semantic versioning** for spec_version
6. **Include examples** in API request/response bodies
7. **Specify units** for all measurements (px, ms, seconds, MB)

### Completeness Checklist

For `fullstack` domain, ensure all sections are present:
- ✅ Architecture with modules
- ✅ UI Components with design system
- ✅ API Specifications
- ✅ Database Schema
- ✅ State Management
- ✅ Security Requirements
- ✅ Performance Requirements
- ✅ Testing Requirements

---

## 10. Validation

### JSON Schema

Validate your spec against the official schema:

```bash
vibes validate spec.json --schema https://vibespec.dev/schema/v1.0.0
```

### Required Validations

1. All required root fields present
2. Valid domain value
3. Semantic versioning for spec_version
4. Valid ISO 8601 timestamp in metadata
5. All referenced modules in dependencies exist
6. All API endpoints follow RESTful conventions
7. All color codes are valid hex

---

## 11. Migration Guide

### From Unstructured to Standardized

If you have existing specs, use the migration tool:

```bash
vibes migrate old-spec.json --output new-spec.json --target-version 1.0.0
```

### Version Compatibility

- **v1.0.0**: Initial standard format
- Future versions will include migration paths

---

## 12. Examples

### Minimal Spec (Backend Only)

```json
{
  "$schema": "https://vibespec.dev/schema/v1.0.0",
  "spec_version": "1.0.0",
  "title": "Simple API",
  "domain": "backend",
  "description": "A simple REST API",
  "requirements": ["RESTful endpoints", "Authentication"],
  "api_specifications": {...},
  "database_schema": {...},
  "tech_stack": ["Node.js", "Express", "PostgreSQL"],
  "acceptance_criteria": ["API responds within 200ms"],
  "metadata": {...}
}
```

### Full-Stack Spec

See: `examples/requirement-2025-10-31T09-05-21.spec.example.json`

---

## 13. Tooling Integration

### IDE Support

- JSON Schema validation in VS Code
- Auto-completion for standard fields
- Linting for consistency

### CI/CD Integration

```yaml
- name: Validate Spec
  run: vibes validate spec.json

- name: Generate Documentation
  run: vibes docs spec.json --output ./docs
```

---

## 14. Contributing

To propose changes to the standard:

1. Open an issue with the proposal
2. Include rationale and use cases
3. Provide migration path for existing specs
4. Update this documentation

---

## Appendix A: Complete Field Reference

See `spec-standard-template.json` for a complete template with all possible fields.

## Appendix B: Domain-Specific Requirements

### Frontend Domain
Required sections:
- `ui_components.design_system`
- `ui_components.accessibility`
- `ui_components.interfaces`
- `state_management`

### Backend Domain
Required sections:
- `api_specifications`
- `database_schema`
- `security_requirements`
- `backend_architecture` (NEW)
- `architecture_decision` (NEW)

### Fullstack Domain
Required sections: All of the above

---

## Appendix C: Backend Architecture Decision Guide

### Overview

When designing backend systems, choosing the right architecture pattern is critical. VibeSpec now includes explicit architecture decision support to help make informed choices between microservices, monolithic, modular-monolith, and serverless architectures.

### Architecture Patterns

#### 1. Microservices Architecture

**When to Use:**
- **Scalability**: 1000+ concurrent users, need to scale services independently
- **Domain Complexity**: Multiple distinct bounded contexts (e.g., user management, payments, notifications)
- **Team Structure**: Multiple teams working independently on different services
- **Technology Diversity**: Different services need different technology stacks
- **Variable Load**: Different features have different resource requirements
- **Independent Deployment**: Services need to be deployed independently and frequently

**Benefits:**
- Independent scaling of services
- Technology flexibility per service
- Fault isolation (one service failure doesn't affect others)
- Team autonomy
- Independent deployment cycles

**Challenges:**
- Distributed system complexity
- Network latency and reliability
- Data consistency across services
- Increased operational overhead
- Debugging and monitoring complexity
- Transaction management across services

**Example Structure:**
```json
{
  "backend_architecture": {
    "pattern": "microservices",
    "services": [
      {
        "name": "user-service",
        "domain": "user-management",
        "description": "Handles user authentication and profile management",
        "responsibilities": ["User CRUD", "Authentication", "Authorization"],
        "database": "users_db",
        "api_endpoints": ["/api/users", "/api/auth"],
        "dependencies": ["notification-service"],
        "communication": "REST",
        "scalability": "horizontal"
      },
      {
        "name": "payment-service",
        "domain": "payment-processing",
        "description": "Handles payment transactions",
        "responsibilities": ["Process payments", "Manage payment methods"],
        "database": "payments_db",
        "api_endpoints": ["/api/payments"],
        "dependencies": ["user-service", "notification-service"],
        "communication": "REST",
        "scalability": "horizontal"
      }
    ],
    "shared_infrastructure": {
      "api_gateway": "Kong / AWS API Gateway",
      "service_discovery": "Kubernetes DNS / Consul",
      "message_broker": "Apache Kafka / RabbitMQ",
      "distributed_tracing": "Jaeger / Zipkin",
      "caching": "Redis",
      "load_balancer": "AWS ALB / NGINX"
    },
    "data_consistency": {
      "pattern": "eventual-consistency",
      "saga_orchestration": true,
      "event_sourcing": false
    }
  }
}
```

#### 2. Monolithic Architecture

**When to Use:**
- **Scalability**: < 100 concurrent users
- **Simplicity**: Simple CRUD application
- **Team Size**: Small team (< 5 developers)
- **Tight Coupling**: Features naturally share data and logic
- **Fast Development**: Need quick initial development
- **Limited Resources**: Limited DevOps infrastructure

**Benefits:**
- Simple development and deployment
- Easier debugging and testing
- Strong consistency by default
- Lower operational complexity
- Faster initial development

**Challenges:**
- Scaling requires scaling entire application
- Limited technology flexibility
- Tight coupling between features
- Longer deployment cycles as app grows
- Single point of failure

#### 3. Modular Monolith

**When to Use:**
- **Scalability**: 100-1000 concurrent users
- **Domain Clarity**: Clear domain boundaries but shared deployment acceptable
- **Team Size**: Small to medium teams (< 10 developers)
- **Future Planning**: Want simple start with future microservices migration path
- **Shared Transactions**: Common transactions across domains

**Benefits:**
- Clear module boundaries
- Easier to refactor to microservices later
- Simpler deployment than microservices
- Strong consistency
- Better than pure monolith for organization

**Challenges:**
- Still scales as one unit
- Requires discipline to maintain boundaries
- Shared database can become bottleneck

#### 4. Serverless Architecture

**When to Use:**
- **Event-Driven**: Event-driven workflows
- **Variable Traffic**: Intermittent or spiky traffic patterns
- **Minimal Ops**: Want minimal infrastructure management
- **Cost**: Pay-per-use cost model important
- **Stateless**: Functions are stateless

**Benefits:**
- Auto-scaling
- Pay-per-execution
- No infrastructure management
- Fast deployment

**Challenges:**
- Cold start latency
- Vendor lock-in
- Limited execution time
- Debugging complexity

### Decision Framework

Use this decision tree:

1. **Is this a simple CRUD app with < 100 concurrent users?**
   → YES: **Monolithic**

2. **Do you have < 1000 concurrent users but clear domain boundaries?**
   → YES: **Modular Monolith**

3. **Do you have 1000+ concurrent users OR multiple independent teams?**
   → YES: Consider **Microservices**

4. **Is your workload event-driven with intermittent traffic?**
   → YES: Consider **Serverless**

5. **Multiple distinct bounded contexts requiring independent scaling?**
   → YES: **Microservices**

6. **When in doubt**: Start with **Modular Monolith**, migrate to microservices when needed

### Spec Structure for Backend Architecture

```json
{
  "backend_architecture": {
    "pattern": "microservices | monolithic | modular-monolith | serverless",
    "services": [...],
    "shared_infrastructure": {...},
    "data_consistency": {...}
  },
  "architecture_decision": {
    "pattern": "microservices",
    "rationale": [
      "High scalability requirements (5000+ concurrent users)",
      "Multiple distinct bounded contexts (users, payments, analytics)",
      "Need for independent deployment of services",
      "Multiple teams working on different features"
    ],
    "trade_offs": {
      "benefits": [
        "Independent scaling per service",
        "Technology flexibility",
        "Fault isolation"
      ],
      "challenges": [
        "Increased operational complexity",
        "Distributed system challenges",
        "Data consistency management"
      ]
    },
    "decision_drivers": {
      "scalability_requirements": "5000+ concurrent users with variable load patterns",
      "team_structure": "3 independent teams working on different domains",
      "domain_complexity": "3 distinct bounded contexts with clear boundaries",
      "deployment_frequency": "Multiple deployments per day required"
    }
  }
}
```

### Inter-Service Communication

For microservices, specify how services communicate:

**Synchronous (REST/gRPC):**
- Use for: Real-time queries, immediate consistency needed
- Example: User service calls Auth service to validate token

**Asynchronous (Message Queue/Events):**
- Use for: Background processing, eventual consistency acceptable
- Example: Order service publishes event, notification service subscribes

```json
{
  "api_endpoints": [
    {
      "name": "Create Order",
      "service": "order-service",
      "endpoint": "/api/orders",
      "method": "POST",
      "inter_service_calls": [
        {
          "target_service": "user-service",
          "endpoint": "/api/users/:id",
          "purpose": "Validate user exists and has valid payment method",
          "type": "synchronous"
        }
      ]
    }
  ]
}
```

### Database Strategies

**Database-per-Service (Microservices):**
- Each service owns its data
- Services communicate via APIs
- Eventual consistency

**Shared Database (Monolith/Modular-Monolith):**
- Single database for all modules
- Strong consistency
- Simpler transactions

### Migration Path

**Monolith → Modular Monolith → Microservices:**

1. Start with modular monolith
2. Identify service boundaries
3. Extract one service at a time
4. Start with least coupled services
5. Gradually migrate others

---

**Version**: 1.1.0
**Last Updated**: 2025-11-04
**Status**: Draft
