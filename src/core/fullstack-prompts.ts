/**
 * Enhanced prompts for fullstack domain specs
 * Generates detailed entity definitions, API contracts, and type mappings
 */

import { HeuristicOutput, Domain } from '../types';

/**
 * Build enhanced prompt for fullstack domain
 */
export function buildFullstackPrompt(input: string, heuristic: HeuristicOutput, simplified: boolean = false): string {
  // Use simplified version for free/smaller models
  if (simplified) {
    return buildSimplifiedFullstackPrompt(input, heuristic);
  }

  return `You are an expert system architect specializing in fullstack application specifications. Your task is to create a comprehensive, type-safe specification that eliminates frontend-backend synchronization bugs.

Raw Input:
${input}

Heuristic Parse:
${JSON.stringify(heuristic, null, 2)}

BACKEND ARCHITECTURE ANALYSIS:
First, analyze if the backend should use microservices or monolithic architecture:

MICROSERVICES indicators:
- Scalability: 1000+ concurrent users, "high traffic", "scale independently"
- Multiple domains: user management, payments, notifications as separate services
- Large/multiple teams working independently
- Need for independent deployment and technology choices

MONOLITHIC/MODULAR-MONOLITH indicators:
- Scalability: < 1000 concurrent users
- Simple to medium complexity
- Single or small team (< 10 developers)
- Shared transactions common across features
- Faster initial development priority

Create a detailed spec with the following JSON structure. This spec will be used by AI code generators, so precision is critical:

{
  "title": "Short descriptive title (5-100 chars)",
  "domain": "fullstack",
  "description": "Concise overview (10-500 chars)",
  "requirements": ["List of concrete functional requirements"],
  "components": ["Logical or UI components involved"],
  "tech_stack": ["Technologies or frameworks detected"],

  "entities": [
    {
      "name": "EntityName (PascalCase, singular)",
      "description": "What this entity represents",
      "fields": [
        {
          "name": "field_name (use camelCase for API, snake_case will be auto-converted for DB)",
          "type": "One of: string, number, boolean, date, datetime, uuid, enum, array, object",
          "required": true/false,
          "unique": true/false (optional),
          "default": "default value (optional)",
          "min_length": 1 (for strings, optional),
          "max_length": 255 (for strings, optional),
          "min_value": 0 (for numbers, optional),
          "max_value": 100 (for numbers, optional),
          "pattern": "regex pattern (for string validation, optional)",
          "enum_values": ["value1", "value2"] (only for enum type),
          "description": "What this field represents"
        }
      ],
      "relationships": [
        {
          "type": "one-to-one | one-to-many | many-to-many",
          "target_entity": "RelatedEntityName",
          "foreign_key": "foreignKeyField",
          "description": "Relationship description"
        }
      ],
      "indexes": ["field1", "field2"] (fields that need database indexes)
    }
  ],

  "api_endpoints": [
    {
      "name": "Descriptive name (e.g., 'Create Task', 'Get User By ID')",
      "method": "GET | POST | PUT | PATCH | DELETE",
      "endpoint": "/api/resource/:id (use REST conventions)",
      "authentication": "none | bearer | api-key | session",
      "description": "What this endpoint does",
      "request": {
        "path_params": {
          "id": { "type": "uuid", "description": "Resource ID", "required": true }
        },
        "query_params": {
          "filter": { "type": "string", "description": "Filter criteria", "required": false }
        },
        "body": {
          "field1": { "type": "string", "required": true, "description": "..." },
          "field2": { "type": "number", "required": false, "default": 0, "description": "..." }
        }
      },
      "responses": [
        {
          "status": 200,
          "description": "Success",
          "body": {
            "id": "uuid",
            "field1": "string",
            "field2": "number",
            "createdAt": "string (ISO 8601 datetime)"
          }
        },
        {
          "status": 400,
          "description": "Validation error",
          "body": {
            "error": "string",
            "details": [{ "field": "string", "message": "string" }]
          }
        },
        {
          "status": 401,
          "description": "Unauthorized",
          "body": { "error": "string" }
        },
        {
          "status": 404,
          "description": "Not found",
          "body": { "error": "string" }
        },
        {
          "status": 500,
          "description": "Server error",
          "body": { "error": "string" }
        }
      ],
      "validation_rules": [
        {
          "field": "field1",
          "rules": ["required", "string", "min_length:1", "max_length:200"],
          "custom_message": "Custom error message (optional)"
        }
      ]
    }
  ],

  "data_mapping": {
    "naming_convention": {
      "database": "snake_case",
      "api": "camelCase",
      "frontend": "camelCase"
    },
    "date_handling": {
      "database": "TIMESTAMP WITH TIME ZONE",
      "api_format": "ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)",
      "frontend_display": "Use date-fns or dayjs for formatting"
    },
    "transformations": [
      {
        "entity": "EntityName",
        "mappings": {
          "database_field_name": "apiFrontendFieldName"
        }
      }
    ]
  },

  "backend_architecture": {
    "pattern": "microservices | monolithic | modular-monolith (choose based on requirements analysis above)",
    "services": [
      {
        "name": "service-name (if microservices/modular-monolith)",
        "domain": "business domain",
        "description": "Service responsibility",
        "responsibilities": ["List of responsibilities"],
        "database": "database name",
        "api_endpoints": ["/api/service/endpoint"],
        "dependencies": ["other-service-name"],
        "communication": "REST | gRPC | Message Queue",
        "scalability": "horizontal | vertical"
      }
    ],
    "shared_infrastructure": {
      "api_gateway": "Technology choice (if microservices)",
      "service_discovery": "Technology choice (if microservices)",
      "message_broker": "Technology choice (if async communication)",
      "caching": "Redis | Memcached",
      "load_balancer": "Technology choice"
    }
  },

  "architecture_decision": {
    "pattern": "microservices | monolithic | modular-monolith",
    "rationale": [
      "Reason based on scalability requirements",
      "Reason based on domain complexity",
      "Reason based on team structure"
    ],
    "trade_offs": {
      "benefits": ["Benefit 1", "Benefit 2"],
      "challenges": ["Challenge 1", "Challenge 2"]
    }
  },

  "type_definitions": {
    "frontend": {
      "EntityName": "interface EntityName { id: string; field1: string; field2: number; createdAt: string; }",
      "CreateEntityRequest": "interface CreateEntityRequest { field1: string; field2?: number; }",
      "EntityResponse": "type EntityResponse = EntityName",
      "EnumType": "type EnumType = 'value1' | 'value2' | 'value3'"
    },
    "backend": {
      "schemas": {
        "entity_table": {
          "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
          "field1": "VARCHAR(200) NOT NULL",
          "field2": "INTEGER DEFAULT 0",
          "created_at": "TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()",
          "updated_at": "TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()"
        }
      }
    }
  },

  "acceptance_criteria": ["Conditions for completion with measurable outcomes"],

  "ai_guidance": {
    "architecture": "Explain the chosen backend architecture pattern and why it fits the requirements",
    "type_safety": "Generate TypeScript interfaces from entity definitions. Ensure frontend and backend share the same type definitions. Use zod or yup for runtime validation.",
    "naming_conventions": "Use camelCase for all API requests/responses and frontend code. Use snake_case only in database layer. Transform field names in API layer using a consistent mapper.",
    "date_handling": "All dates MUST be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ) in API layer. Backend should serialize Date objects to ISO strings. Frontend should parse ISO strings to Date objects.",
    "validation": "Implement IDENTICAL validation on frontend (for UX) and backend (for security). Validation rules defined in API contracts must match on both sides.",
    "error_handling": "Backend MUST return consistent error format: { error: string, details?: { field: string, message: string }[] }. Frontend should parse and display these errors consistently.",
    "security": "Never trust client input. Validate and sanitize all data on backend. Use parameterized queries to prevent SQL injection. Hash passwords with bcrypt.",
    "performance": "Use database indexes on frequently queried fields. Implement pagination for list endpoints. Cache static data. Use connection pooling. For microservices, implement circuit breakers.",
    "testing": "Generate unit tests for validation logic. Test API contracts with integration tests. Ensure frontend types match backend responses. For microservices, add contract tests."
  }
}

CRITICAL REQUIREMENTS:
1. ANALYZE architecture needs and explicitly choose: microservices, monolithic, or modular-monolith
2. For EVERY entity mentioned in requirements, create a complete entity definition with ALL fields
3. For EVERY CRUD operation, create corresponding API endpoints (Create, Read, Update, Delete)
4. Specify EXACT data types for every field (not generic "string" without constraints)
5. Include validation rules for EVERY user input field
6. Define BOTH success and error response formats for every endpoint
7. Ensure field names are consistent between entities, API requests/responses, and type definitions
8. For enums, list ALL possible values explicitly
9. For relationships, specify foreign keys and relationship types clearly
10. Include authentication requirements for protected endpoints
11. Generate TypeScript type definitions that match the entity and API structures EXACTLY
12. If microservices: Define service boundaries, data ownership, and inter-service communication

Remember: The goal is to create a specification so precise that frontend and backend code generated from it will have ZERO type mismatches or synchronization bugs.`;
}

/**
 * Build enhanced prompt for backend domain
 */
export function buildBackendPrompt(input: string, heuristic: HeuristicOutput): string {
  return `You are an expert backend system architect. Create a detailed API specification with architectural decisions.

Raw Input:
${input}

Heuristic Parse:
${JSON.stringify(heuristic, null, 2)}

ARCHITECTURE DECISION FRAMEWORK:

Analyze the requirements and decide on the backend architecture pattern using these criteria:

CHOOSE MICROSERVICES when:
- Scalability requirements: 1000+ concurrent users or mentions of "high traffic", "scale independently"
- Multiple distinct bounded contexts: user management, payments, notifications, analytics as separate domains
- Independent deployment needs: "deploy features independently", "continuous deployment per team"
- Team structure: multiple teams working on different features
- Technology diversity: different tech stacks for different services
- Variable load patterns: some features need more resources than others

CHOOSE MODULAR MONOLITH when:
- Medium scalability: 100-1000 concurrent users
- Clear domain boundaries but shared deployment is acceptable
- Single team or small teams (< 10 developers)
- Want to start simple but plan for future microservices migration
- Shared transactions across domains are common

CHOOSE MONOLITHIC when:
- Low-medium traffic: < 100 concurrent users
- Simple CRUD application with minimal business logic
- Small team (< 5 developers)
- Tight coupling between features is acceptable
- Fast initial development is priority
- Limited DevOps resources

CHOOSE SERVERLESS when:
- Event-driven architecture needed
- Intermittent/spiky traffic patterns
- Want minimal infrastructure management
- Pay-per-use cost model is important

Create a detailed spec with the following JSON structure:

{
  "title": "Short descriptive title",
  "domain": "backend",
  "description": "Concise overview",
  "requirements": ["List of concrete functional requirements"],
  "components": ["Backend components and services"],
  "tech_stack": ["Technologies or frameworks"],

  "backend_architecture": {
    "pattern": "microservices | monolithic | modular-monolith | serverless",
    "services": [
      {
        "name": "service-name (kebab-case)",
        "domain": "business domain (e.g., user-management, payment-processing)",
        "description": "What this service does",
        "responsibilities": ["Responsibility 1", "Responsibility 2"],
        "database": "service_db (separate DB per service for microservices, shared for monolith)",
        "api_endpoints": ["/api/service/endpoint1", "/api/service/endpoint2"],
        "dependencies": ["other-service-name"],
        "communication": "REST | gRPC | GraphQL | Message Queue | Event-Driven",
        "scalability": "horizontal | vertical"
      }
    ],
    "shared_infrastructure": {
      "api_gateway": "Kong | AWS API Gateway | NGINX | Traefik (for microservices)",
      "service_discovery": "Consul | Eureka | Kubernetes DNS (for microservices)",
      "message_broker": "RabbitMQ | Apache Kafka | AWS SQS | Redis Streams (if async communication needed)",
      "distributed_tracing": "Jaeger | Zipkin | AWS X-Ray (for microservices)",
      "caching": "Redis | Memcached",
      "load_balancer": "AWS ALB | NGINX | HAProxy"
    },
    "data_consistency": {
      "pattern": "strong-consistency (for monolith) | eventual-consistency (for microservices)",
      "saga_orchestration": true/false,
      "event_sourcing": true/false
    }
  },

  "architecture_decision": {
    "pattern": "microservices | monolithic | modular-monolith | serverless",
    "rationale": [
      "Reason 1 based on requirements analysis",
      "Reason 2 based on scalability needs",
      "Reason 3 based on team structure"
    ],
    "trade_offs": {
      "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"]
    },
    "decision_drivers": {
      "scalability_requirements": "Expected concurrent users and growth plans",
      "team_structure": "Number of teams and their organization",
      "domain_complexity": "Number of distinct bounded contexts",
      "deployment_frequency": "How often services need independent deployment"
    }
  },

  "entities": [
    {
      "name": "EntityName",
      "service": "service-name (which service owns this entity)",
      "description": "Entity description",
      "fields": [
        {
          "name": "fieldName",
          "type": "string | number | boolean | date | datetime | uuid | enum",
          "required": true/false,
          "unique": true/false,
          "enum_values": ["val1", "val2"] (for enum type),
          "description": "Field description"
        }
      ],
      "relationships": [
        {
          "type": "one-to-one | one-to-many | many-to-many",
          "target_entity": "RelatedEntity",
          "foreign_key": "foreignKey",
          "cross_service": true/false (true if relates to entity in different service)
        }
      ],
      "indexes": ["indexed_field"]
    }
  ],

  "api_endpoints": [
    {
      "name": "Endpoint name",
      "service": "service-name (which service provides this endpoint)",
      "method": "GET | POST | PUT | PATCH | DELETE",
      "endpoint": "/api/service-name/resource/:param",
      "authentication": "none | bearer | api-key | session",
      "description": "What this endpoint does",
      "request": {
        "path_params": { "param": { "type": "type", "required": true } },
        "query_params": { "param": { "type": "type", "required": false } },
        "body": { "field": { "type": "type", "required": true } }
      },
      "responses": [
        { "status": 200, "description": "Success", "body": {} },
        { "status": 400, "description": "Bad request", "body": { "error": "string" } },
        { "status": 401, "description": "Unauthorized" },
        { "status": 404, "description": "Not found" },
        { "status": 500, "description": "Server error" }
      ],
      "validation_rules": [
        { "field": "fieldName", "rules": ["required", "string", "min_length:1"] }
      ],
      "inter_service_calls": [
        {
          "target_service": "other-service-name",
          "endpoint": "/api/other-service/endpoint",
          "purpose": "Why this service needs to call the other service"
        }
      ]
    }
  ],

  "deployment": {
    "container_orchestration": "Kubernetes | Docker Swarm | AWS ECS | Docker Compose",
    "services": [
      {
        "name": "service-name",
        "replicas": 3,
        "resources": {
          "cpu": "500m",
          "memory": "512Mi"
        },
        "health_check": "/health",
        "auto_scaling": {
          "min": 2,
          "max": 10,
          "target_cpu": "70%"
        }
      }
    ],
    "infrastructure": {
      "load_balancer": "AWS ALB | NGINX | HAProxy",
      "service_mesh": "Istio | Linkerd | None",
      "monitoring": "Prometheus + Grafana | DataDog | New Relic",
      "logging": "ELK Stack | Loki | CloudWatch"
    }
  },

  "acceptance_criteria": ["Measurable completion conditions"],

  "ai_guidance": {
    "architecture": "Reasoning for chosen architecture pattern and migration path if starting with monolith",
    "validation": "Validate all inputs. Use validation libraries like Zod or Joi.",
    "error_handling": "Return consistent error format: { error: string, details?: array }",
    "security": "Sanitize inputs, use parameterized queries, hash passwords with bcrypt. Implement API gateway authentication.",
    "performance": "Use database indexes, implement caching, optimize queries. For microservices, use circuit breakers and retries.",
    "testing": "Write unit tests for business logic, integration tests for API endpoints. For microservices, add contract tests.",
    "observability": "Implement distributed tracing, centralized logging, and metrics collection for microservices."
  }
}

CRITICAL REQUIREMENTS:
1. MUST analyze requirements and make explicit architecture decision (microservices vs monolithic vs modular-monolith)
2. MUST provide clear rationale for the architecture choice based on:
   - Scalability requirements (concurrent users, traffic patterns)
   - Domain complexity (number of bounded contexts)
   - Team structure
   - Deployment needs
3. If microservices: Define clear service boundaries with single responsibility
4. If microservices: Specify how services communicate (sync REST/gRPC vs async message queues)
5. If microservices: Define data ownership (which service owns which entities)
6. If microservices: Specify database strategy (database-per-service vs shared database)
7. For cross-service calls: Document inter-service dependencies and communication patterns
8. Include deployment and infrastructure requirements appropriate for the chosen architecture
9. Define complete entity structures and API contracts with service ownership
10. Specify exact data types and validation rules

Remember: Default to MONOLITHIC or MODULAR-MONOLITH unless requirements explicitly justify microservices complexity.`;
}

/**
 * Build enhanced prompt for frontend domain
 */
export function buildFrontendPrompt(input: string, heuristic: HeuristicOutput): string {
  return `You are an expert frontend architect. Create a detailed UI specification.

Raw Input:
${input}

Heuristic Parse:
${JSON.stringify(heuristic, null, 2)}

Create a detailed spec with the following JSON structure:

{
  "title": "Short descriptive title",
  "domain": "frontend",
  "description": "Concise overview",
  "requirements": ["List of UI/UX requirements"],
  "components": ["React/Vue/Angular components"],
  "tech_stack": ["Frontend technologies"],

  "type_definitions": {
    "frontend": {
      "TypeName": "interface TypeName { field: type; }",
      "EnumType": "type EnumType = 'value1' | 'value2'"
    }
  },

  "api_endpoints": [
    {
      "name": "API call name",
      "method": "GET | POST | PUT | DELETE",
      "endpoint": "/api/path",
      "description": "What data this fetches/sends",
      "request": { "body": {} },
      "responses": [
        { "status": 200, "description": "Success", "body": {} }
      ]
    }
  ],

  "acceptance_criteria": ["UI/UX completion conditions"],

  "ai_guidance": {
    "type_safety": "Use TypeScript interfaces for all props and state. Type API responses.",
    "validation": "Validate forms with libraries like react-hook-form + zod. Show inline errors.",
    "error_handling": "Display API errors in user-friendly format. Handle loading and error states.",
    "accessibility": "Use semantic HTML, ARIA labels, keyboard navigation support.",
    "performance": "Lazy load components, memoize expensive computations, optimize re-renders."
  }
}

CRITICAL: Define TypeScript interfaces for all data structures. Specify form validation rules.`;
}

/**
 * Determine if enhanced prompt should be used
 */
export function shouldUseEnhancedPrompt(domain: Domain | undefined): boolean {
  return domain === 'fullstack' || domain === 'backend';
}

/**
 * Build appropriate prompt based on domain
 */
export function buildDomainPrompt(
  domain: Domain | undefined,
  input: string,
  heuristic: HeuristicOutput,
  simplified: boolean = false
): string {
  if (domain === 'fullstack') {
    return buildFullstackPrompt(input, heuristic, simplified);
  } else if (domain === 'backend') {
    return buildBackendPrompt(input, heuristic);
  } else if (domain === 'frontend') {
    return buildFrontendPrompt(input, heuristic);
  }

  // Default prompt for other domains
  return buildBasicPrompt(input, heuristic);
}

/**
 * Basic prompt for non-fullstack domains
 */
function buildBasicPrompt(input: string, heuristic: HeuristicOutput): string {
  return `Given the following raw requirement and preliminary heuristic analysis, refine it into a structured spec.

Raw Input:
${input}

Heuristic Parse:
${JSON.stringify(heuristic, null, 2)}

Refine this into a complete spec with the following JSON structure:
{
  "title": "Short descriptive title (5-100 chars)",
  "domain": "One of: frontend, backend, fullstack, mobile, infrastructure, testing, devops, data",
  "description": "Concise overview (10-500 chars)",
  "requirements": ["List of concrete functional requirements"],
  "components": ["Logical or UI components involved"],
  "tech_stack": ["Technologies or frameworks detected"],
  "acceptance_criteria": ["Conditions for completion"],
  "ai_guidance": "Implementation hints or best practices"
}

Ensure all required fields (title, domain, description, requirements) are present.
Output ONLY valid JSON, no other text or markdown.`;
}

/**
 * Simplified fullstack prompt for free/smaller models
 * Designed to fit within token limits and reduce incomplete responses
 */
function buildSimplifiedFullstackPrompt(input: string, heuristic: HeuristicOutput): string {
  return `Create a JSON specification for this system. Output ONLY valid JSON, no markdown.

Input: ${input}

Required JSON structure:
{
  "title": "string (5-100 chars)",
  "domain": "fullstack",
  "description": "string (10-300 chars)",
  "requirements": ["requirement 1", "requirement 2"],
  "components": ["component 1", "component 2"],
  "tech_stack": ["tech 1", "tech 2"],
  "acceptance_criteria": ["criterion 1", "criterion 2"],

  "entities": [
    {
      "name": "EntityName",
      "description": "string",
      "fields": [
        {
          "name": "fieldName",
          "type": "string|number|boolean|uuid|enum|datetime",
          "required": true,
          "description": "string"
        }
      ]
    }
  ],

  "api_endpoints": [
    {
      "name": "string",
      "method": "GET|POST|PUT|DELETE",
      "endpoint": "/api/path",
      "authentication": "bearer",
      "request": { "body": {} },
      "responses": [
        { "status": 200, "description": "Success", "body": {} }
      ]
    }
  ],

  "ai_guidance": "string (tips for implementation)"
}

IMPORTANT:
- title, domain, description, requirements are REQUIRED
- Define entities for key data models
- Include main CRUD endpoints
- Use exact data types
- Output complete valid JSON only`;
}
