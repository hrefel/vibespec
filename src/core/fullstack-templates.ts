/**
 * Fullstack domain templates for common patterns
 * Provides pre-built templates for CRUD, Auth, Real-time, File Upload, etc.
 */

import { VibeSpec, EntityDefinition, APIContract, DataMapping, TypeDefinitions, EnhancedAIGuidance } from '../types';

/**
 * Template type identifier
 */
export type FullstackTemplateType = 'crud' | 'auth' | 'realtime' | 'file-upload' | 'search' | 'pagination';

/**
 * CRUD Template - Standard Create, Read, Update, Delete operations
 */
export function generateCRUDTemplate(entityName: string, fields: any[] = []): Partial<VibeSpec> {
  const entityNameLower = entityName.toLowerCase();
  const entityNamePlural = `${entityNameLower}s`; // Simple pluralization

  // Default fields if none provided
  const defaultFields = fields.length > 0 ? fields : [
    {
      name: 'id',
      type: 'uuid',
      required: true,
      unique: true,
      description: `Unique ${entityName} identifier`
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      min_length: 1,
      max_length: 200,
      description: `${entityName} name`
    },
    {
      name: 'description',
      type: 'string',
      required: false,
      max_length: 2000,
      description: `${entityName} description`
    },
    {
      name: 'createdAt',
      type: 'datetime',
      required: true,
      description: 'Creation timestamp'
    },
    {
      name: 'updatedAt',
      type: 'datetime',
      required: true,
      description: 'Last update timestamp'
    }
  ];

  const entity: EntityDefinition = {
    name: entityName,
    description: `${entityName} entity for CRUD operations`,
    fields: defaultFields,
    indexes: ['id', 'createdAt']
  };

  const apiEndpoints: APIContract[] = [
    // CREATE
    {
      name: `Create ${entityName}`,
      method: 'POST',
      endpoint: `/api/${entityNamePlural}`,
      authentication: 'bearer',
      description: `Create a new ${entityName}`,
      request: {
        body: {
          name: { type: 'string', required: true, description: `${entityName} name` },
          description: { type: 'string', required: false, description: `${entityName} description` }
        }
      },
      responses: [
        {
          status: 201,
          description: `${entityName} created successfully`,
          body: {
            id: 'uuid',
            name: 'string',
            description: 'string | null',
            createdAt: 'string (ISO 8601)',
            updatedAt: 'string (ISO 8601)'
          }
        },
        {
          status: 400,
          description: 'Validation error',
          body: { error: 'string', details: [{ field: 'string', message: 'string' }] }
        },
        { status: 401, description: 'Unauthorized', body: { error: 'string' } }
      ],
      validation_rules: [
        { field: 'name', rules: ['required', 'string', 'min_length:1', 'max_length:200'] }
      ]
    },
    // READ ALL
    {
      name: `Get All ${entityName}s`,
      method: 'GET',
      endpoint: `/api/${entityNamePlural}`,
      authentication: 'bearer',
      description: `Retrieve all ${entityNamePlural}`,
      request: {
        query_params: {
          page: { type: 'number', required: false, default: 1, description: 'Page number' },
          limit: { type: 'number', required: false, default: 20, description: 'Items per page' },
          sort: { type: 'string', required: false, default: 'createdAt:desc', description: 'Sort field and order' }
        }
      },
      responses: [
        {
          status: 200,
          description: 'Success',
          body: {
            data: [{ id: 'uuid', name: 'string', description: 'string | null', createdAt: 'string', updatedAt: 'string' }],
            pagination: { total: 'number', page: 'number', limit: 'number', totalPages: 'number' }
          }
        },
        { status: 401, description: 'Unauthorized', body: { error: 'string' } }
      ]
    },
    // READ ONE
    {
      name: `Get ${entityName} By ID`,
      method: 'GET',
      endpoint: `/api/${entityNamePlural}/:id`,
      authentication: 'bearer',
      description: `Retrieve a specific ${entityName} by ID`,
      request: {
        path_params: {
          id: { type: 'uuid', required: true, description: `${entityName} ID` }
        }
      },
      responses: [
        {
          status: 200,
          description: 'Success',
          body: { id: 'uuid', name: 'string', description: 'string | null', createdAt: 'string', updatedAt: 'string' }
        },
        { status: 401, description: 'Unauthorized', body: { error: 'string' } },
        { status: 404, description: 'Not found', body: { error: 'string' } }
      ]
    },
    // UPDATE
    {
      name: `Update ${entityName}`,
      method: 'PUT',
      endpoint: `/api/${entityNamePlural}/:id`,
      authentication: 'bearer',
      description: `Update an existing ${entityName}`,
      request: {
        path_params: {
          id: { type: 'uuid', required: true, description: `${entityName} ID` }
        },
        body: {
          name: { type: 'string', required: false, description: `${entityName} name` },
          description: { type: 'string', required: false, description: `${entityName} description` }
        }
      },
      responses: [
        {
          status: 200,
          description: `${entityName} updated successfully`,
          body: { id: 'uuid', name: 'string', description: 'string | null', createdAt: 'string', updatedAt: 'string' }
        },
        { status: 400, description: 'Validation error', body: { error: 'string', details: [{ field: 'string', message: 'string' }] } },
        { status: 401, description: 'Unauthorized', body: { error: 'string' } },
        { status: 404, description: 'Not found', body: { error: 'string' } }
      ]
    },
    // DELETE
    {
      name: `Delete ${entityName}`,
      method: 'DELETE',
      endpoint: `/api/${entityNamePlural}/:id`,
      authentication: 'bearer',
      description: `Delete a ${entityName}`,
      request: {
        path_params: {
          id: { type: 'uuid', required: true, description: `${entityName} ID` }
        }
      },
      responses: [
        { status: 204, description: `${entityName} deleted successfully` },
        { status: 401, description: 'Unauthorized', body: { error: 'string' } },
        { status: 404, description: 'Not found', body: { error: 'string' } }
      ]
    }
  ];

  const dataMapping: DataMapping = {
    naming_convention: {
      database: 'snake_case',
      api: 'camelCase',
      frontend: 'camelCase'
    },
    date_handling: {
      database: 'TIMESTAMP WITH TIME ZONE',
      api_format: 'ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)',
      frontend_display: 'Use date-fns or dayjs for formatting'
    },
    transformations: [
      {
        entity: entityName,
        mappings: {
          'created_at': 'createdAt',
          'updated_at': 'updatedAt'
        }
      }
    ]
  };

  const typeDefinitions: TypeDefinitions = {
    frontend: {
      [entityName]: `interface ${entityName} { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }`,
      [`Create${entityName}Request`]: `interface Create${entityName}Request { name: string; description?: string; }`,
      [`Update${entityName}Request`]: `interface Update${entityName}Request { name?: string; description?: string; }`,
      [`${entityName}ListResponse`]: `interface ${entityName}ListResponse { data: ${entityName}[]; pagination: { total: number; page: number; limit: number; totalPages: number; }; }`
    },
    backend: {
      schemas: {
        [`${entityNameLower}_table`]: {
          id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
          name: 'VARCHAR(200) NOT NULL',
          description: 'TEXT',
          created_at: 'TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()',
          updated_at: 'TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()'
        }
      }
    }
  };

  const aiGuidance: EnhancedAIGuidance = {
    type_safety: `Use the generated TypeScript interfaces for ${entityName}. Ensure type consistency across frontend and backend.`,
    naming_conventions: 'Use camelCase in API/frontend, snake_case in database. Transform in API middleware.',
    date_handling: 'Serialize dates to ISO 8601 strings in API responses. Parse on frontend.',
    validation: 'Validate name field (required, 1-200 chars) on both frontend and backend.',
    error_handling: 'Return consistent error format with field-level details for validation errors.',
    security: 'Verify JWT token for all endpoints. Implement authorization checks.',
    performance: 'Add database index on id and createdAt. Implement pagination with default limit 20.',
    testing: 'Test all CRUD operations. Verify validation rules. Test error cases (404, 401, 400).'
  };

  return {
    entities: [entity],
    api_endpoints: apiEndpoints,
    data_mapping: dataMapping,
    type_definitions: typeDefinitions,
    ai_guidance: aiGuidance
  };
}

/**
 * Authentication Template - JWT-based auth system
 */
export function generateAuthTemplate(): Partial<VibeSpec> {
  const userEntity: EntityDefinition = {
    name: 'User',
    description: 'User entity for authentication',
    fields: [
      { name: 'id', type: 'uuid', required: true, unique: true, description: 'User ID' },
      { name: 'email', type: 'string', required: true, unique: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', description: 'User email' },
      { name: 'passwordHash', type: 'string', required: true, description: 'Bcrypt password hash' },
      { name: 'name', type: 'string', required: true, min_length: 2, max_length: 100, description: 'User full name' },
      { name: 'role', type: 'enum', required: true, enum_values: ['user', 'admin'], default: 'user', description: 'User role' },
      { name: 'isActive', type: 'boolean', required: true, default: true, description: 'Account active status' },
      { name: 'emailVerified', type: 'boolean', required: true, default: false, description: 'Email verification status' },
      { name: 'createdAt', type: 'datetime', required: true, description: 'Account creation date' },
      { name: 'updatedAt', type: 'datetime', required: true, description: 'Last update date' },
      { name: 'lastLoginAt', type: 'datetime', required: false, description: 'Last login timestamp' }
    ],
    indexes: ['id', 'email', 'createdAt']
  };

  const authEndpoints: APIContract[] = [
    // REGISTER
    {
      name: 'Register User',
      method: 'POST',
      endpoint: '/api/auth/register',
      authentication: 'none',
      description: 'Register a new user account',
      request: {
        body: {
          email: { type: 'string', required: true, description: 'User email' },
          password: { type: 'string', required: true, description: 'User password (min 8 chars)' },
          name: { type: 'string', required: true, description: 'User full name' }
        }
      },
      responses: [
        {
          status: 201,
          description: 'User registered successfully',
          body: {
            user: { id: 'string', email: 'string', name: 'string', role: 'string' },
            accessToken: 'string (JWT)',
            refreshToken: 'string'
          }
        },
        {
          status: 400,
          description: 'Validation error or email already exists',
          body: { error: 'string', details: [{ field: 'string', message: 'string' }] }
        }
      ],
      validation_rules: [
        { field: 'email', rules: ['required', 'email', 'unique:users.email'] },
        { field: 'password', rules: ['required', 'string', 'min_length:8', 'regex:^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$'], custom_message: 'Password must contain uppercase, lowercase, and number' },
        { field: 'name', rules: ['required', 'string', 'min_length:2', 'max_length:100'] }
      ]
    },
    // LOGIN
    {
      name: 'Login User',
      method: 'POST',
      endpoint: '/api/auth/login',
      authentication: 'none',
      description: 'Authenticate user and return JWT tokens',
      request: {
        body: {
          email: { type: 'string', required: true, description: 'User email' },
          password: { type: 'string', required: true, description: 'User password' }
        }
      },
      responses: [
        {
          status: 200,
          description: 'Login successful',
          body: {
            user: { id: 'string', email: 'string', name: 'string', role: 'string' },
            accessToken: 'string (JWT)',
            refreshToken: 'string'
          }
        },
        { status: 401, description: 'Invalid credentials', body: { error: 'Invalid email or password' } }
      ],
      validation_rules: [
        { field: 'email', rules: ['required', 'email'] },
        { field: 'password', rules: ['required', 'string'] }
      ]
    },
    // REFRESH TOKEN
    {
      name: 'Refresh Access Token',
      method: 'POST',
      endpoint: '/api/auth/refresh',
      authentication: 'none',
      description: 'Get new access token using refresh token',
      request: {
        body: {
          refreshToken: { type: 'string', required: true, description: 'Refresh token' }
        }
      },
      responses: [
        {
          status: 200,
          description: 'Token refreshed successfully',
          body: { accessToken: 'string (JWT)', refreshToken: 'string' }
        },
        { status: 401, description: 'Invalid refresh token', body: { error: 'string' } }
      ]
    },
    // GET CURRENT USER
    {
      name: 'Get Current User',
      method: 'GET',
      endpoint: '/api/auth/me',
      authentication: 'bearer',
      description: 'Get current authenticated user profile',
      responses: [
        {
          status: 200,
          description: 'Success',
          body: { id: 'string', email: 'string', name: 'string', role: 'string', emailVerified: 'boolean', createdAt: 'string' }
        },
        { status: 401, description: 'Unauthorized', body: { error: 'string' } }
      ]
    },
    // LOGOUT
    {
      name: 'Logout User',
      method: 'POST',
      endpoint: '/api/auth/logout',
      authentication: 'bearer',
      description: 'Invalidate refresh token',
      responses: [
        { status: 204, description: 'Logged out successfully' },
        { status: 401, description: 'Unauthorized', body: { error: 'string' } }
      ]
    }
  ];

  const typeDefinitions: TypeDefinitions = {
    frontend: {
      User: `interface User { id: string; email: string; name: string; role: 'user' | 'admin'; emailVerified: boolean; createdAt: string; }`,
      RegisterRequest: `interface RegisterRequest { email: string; password: string; name: string; }`,
      LoginRequest: `interface LoginRequest { email: string; password: string; }`,
      AuthResponse: `interface AuthResponse { user: User; accessToken: string; refreshToken: string; }`
    },
    backend: {
      schemas: {
        users_table: {
          id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
          email: 'VARCHAR(255) UNIQUE NOT NULL',
          password_hash: 'VARCHAR(255) NOT NULL',
          name: 'VARCHAR(100) NOT NULL',
          role: "VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))",
          is_active: 'BOOLEAN NOT NULL DEFAULT TRUE',
          email_verified: 'BOOLEAN NOT NULL DEFAULT FALSE',
          created_at: 'TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()',
          updated_at: 'TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()',
          last_login_at: 'TIMESTAMP WITH TIME ZONE'
        },
        refresh_tokens_table: {
          id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
          user_id: 'UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE',
          token: 'VARCHAR(500) UNIQUE NOT NULL',
          expires_at: 'TIMESTAMP WITH TIME ZONE NOT NULL',
          created_at: 'TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()'
        }
      }
    }
  };

  const aiGuidance: EnhancedAIGuidance = {
    type_safety: 'Use TypeScript interfaces for User and Auth responses. Type JWT payloads.',
    naming_conventions: 'Use camelCase for API, snake_case for database.',
    date_handling: 'Store timestamps in UTC. Return ISO 8601 strings in API.',
    validation: 'Validate email format, password strength (min 8 chars, uppercase, lowercase, number). Check email uniqueness.',
    error_handling: 'Never expose password validation errors in detail. Return generic "Invalid credentials" for login failures.',
    security: 'Hash passwords with bcrypt (cost factor 10). Use JWT with 15-minute access token, 7-day refresh token. Store refresh tokens in database. Implement token rotation. Never log passwords.',
    performance: 'Add index on users.email. Use connection pooling. Implement rate limiting (5 attempts per 15 minutes).',
    testing: 'Test registration validation. Test login with valid/invalid credentials. Test token refresh. Test password hashing.'
  };

  return {
    entities: [userEntity],
    api_endpoints: authEndpoints,
    type_definitions: typeDefinitions,
    data_mapping: {
      naming_convention: {
        database: 'snake_case',
        api: 'camelCase',
        frontend: 'camelCase'
      },
      date_handling: {
        database: 'TIMESTAMP WITH TIME ZONE',
        api_format: 'ISO 8601 string',
        frontend_display: 'Format with date-fns'
      }
    },
    ai_guidance: aiGuidance
  };
}

/**
 * Get template by type
 */
export function getFullstackTemplate(type: FullstackTemplateType, entityName: string = 'Item'): Partial<VibeSpec> {
  switch (type) {
    case 'crud':
      return generateCRUDTemplate(entityName);
    case 'auth':
      return generateAuthTemplate();
    // Add more templates as needed
    default:
      return generateCRUDTemplate(entityName);
  }
}

/**
 * Detect if input matches a template pattern
 */
export function detectTemplatePattern(input: string): FullstackTemplateType | null {
  const inputLower = input.toLowerCase();

  if (inputLower.includes('auth') || inputLower.includes('login') || inputLower.includes('register') || inputLower.includes('jwt')) {
    return 'auth';
  }

  if (inputLower.includes('crud') || (inputLower.includes('create') && inputLower.includes('read') && inputLower.includes('update') && inputLower.includes('delete'))) {
    return 'crud';
  }

  return null;
}
