# Example: Database Entity Requirement

This example shows a complete database entity specification with proper constraints.

---
id: ENTITY_mn3k7_x9b
type: entity
title: User Entity for Authentication System
domain: backend
priority: high
tags:
  - entity
  - backend
  - database
  - user-management
metadata:
  spec_version: 1.0.0
  generated_by: vibespec-cli
  generated_at: '2025-10-29T10:30:00.000Z'
  constraints_complete: true
  wizard_used: true
---

## Context

**Problem:** Need a database entity to store user account information for the authentication system

**Background:** We are building a new user management system from scratch. This is the core user entity that will be referenced by other tables (sessions, profiles, permissions).

**Assumptions:**
- PostgreSQL database
- UUID for primary keys
- Timestamps in UTC
- Soft delete pattern (no hard deletes)

## Entities

### User

User accounts for authentication and authorization

**Fields:**

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `id` | uuid | ✓ | ✓ |  | Primary key (auto-generated) |
| `email` | varchar(255) | ✓ | ✓ |  | User's email address |
| `username` | varchar(30) |  | ✓ |  | Optional username |
| `password_hash` | varchar(255) | ✓ |  |  | Bcrypt hashed password |
| `email_verified` | boolean | ✓ |  | `false` | Email verification status |
| `is_active` | boolean | ✓ |  | `true` | Account active status |
| `is_deleted` | boolean | ✓ |  | `false` | Soft delete flag |
| `last_login_at` | timestamp |  |  |  | Last successful login timestamp |
| `failed_login_attempts` | integer | ✓ |  | `0` | Count of failed login attempts |
| `locked_until` | timestamp |  |  |  | Account lock expiration time |
| `created_at` | timestamp | ✓ |  | `now()` | Record creation timestamp |
| `updated_at` | timestamp | ✓ |  | `now()` | Record last update timestamp |
| `deleted_at` | timestamp |  |  |  | Soft delete timestamp |

**Relationships:**
- one-to-many with `UserProfile` - User profile information
- one-to-many with `UserSession` - Active user sessions
- many-to-many with `Role` - User roles and permissions

**Indexes:** `id`, `email`, `username`, `created_at`, `is_deleted`

## Business Constraints

### BC001 🔴 [MANDATORY]

**Rule:** Email must be unique across all non-deleted users (where is_deleted = false)

**Rationale:** Prevents duplicate accounts with same email. Allows email reuse after account deletion.

**Examples:**
- Valid: user@example.com with is_deleted=false, then another user@example.com with is_deleted=true
- Invalid: Two active accounts with user@example.com where both have is_deleted=false

### BC002 🔴 [MANDATORY]

**Rule:** Username must be unique across all non-deleted users if provided (where is_deleted = false AND username IS NOT NULL)

**Rationale:** Ensures unique user identifiers while allowing username to be optional

### BC003 🔴 [MANDATORY]

**Rule:** Password hash must never be exposed in any API response or logs

**Rationale:** Security requirement - password hashes should only be used for verification, never transmitted

### BC004 🔴 [MANDATORY]

**Rule:** Account must be locked for 15 minutes after 5 consecutive failed login attempts

**Rationale:** Protects against brute force attacks on user accounts

**Examples:**
- After 5th failed attempt: locked_until = current_time + 15 minutes
- After successful login: failed_login_attempts reset to 0

### BC005 🟡 [RECOMMENDED]

**Rule:** Deleted accounts should retain data for 90 days before permanent deletion

**Rationale:** Allows account recovery if user changes mind. Compliance with data retention policies.

## Technical Constraints

### TC001 🔴 [MANDATORY]

**Rule:** Primary key must be UUID v4 for distributed system compatibility

**Rationale:** UUIDs prevent ID collision in distributed database scenarios and improve security by not exposing sequential IDs

### TC002 🔴 [MANDATORY]

**Rule:** All timestamp fields must store values in UTC timezone

**Rationale:** Ensures consistent time handling across different server locations and client timezones

### TC003 🔴 [MANDATORY]

**Rule:** Email field must have a unique index on (email) WHERE is_deleted = false

**Rationale:** Enforces email uniqueness constraint at database level while allowing reuse after deletion

### TC004 🔴 [MANDATORY]

**Rule:** Database must enforce NOT NULL constraints on required fields (id, email, password_hash, is_active, is_deleted, created_at, updated_at)

**Rationale:** Prevents data integrity issues by ensuring critical fields always have values

### TC005 🔴 [MANDATORY]

**Rule:** Username field must have CHECK constraint: username ~ '^[a-zA-Z0-9_]{3,30}$' if not null

**Rationale:** Ensures username format consistency at database level

### TC006 🟡 [RECOMMENDED]

**Rule:** Table should have composite index on (email, is_deleted) for query performance

**Rationale:** Most queries filter by email and is_deleted together. Composite index improves performance.

### TC007 🟡 [RECOMMENDED]

**Rule:** Foreign key constraints should use ON DELETE RESTRICT for user references

**Rationale:** Prevents accidental data loss. Forces explicit handling of related records before user deletion.

## Examples

### Valid User Record

**Input:**
```json
{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Output:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password_hash": "$2b$10$rXOSs9z8G8p7p7p7p7p7p7p7p7p7p7p7p7p7p7p7p7p7p7p",
  "email_verified": false,
  "is_active": true,
  "is_deleted": false,
  "last_login_at": null,
  "failed_login_attempts": 0,
  "locked_until": null,
  "created_at": "2025-10-29T10:30:00.000Z",
  "updated_at": "2025-10-29T10:30:00.000Z",
  "deleted_at": null
}
```

**Expected Behavior:** User record created with default values, password properly hashed

### Duplicate Email Attempt [EDGE CASE]

**Input:**
```sql
INSERT INTO users (id, email, password_hash, is_active, is_deleted)
VALUES (uuid_generate_v4(), 'existing@example.com', 'hash123', true, false);
-- When user with email 'existing@example.com' already exists with is_deleted = false
```

**Expected Behavior:** Database constraint violation error, insert fails

### Account Locking After Failed Attempts [EDGE CASE]

**Input:**
```json
{
  "failed_login_attempts": 5,
  "locked_until": "2025-10-29T10:45:00.000Z"
}
```

**Expected Behavior:** Login attempts blocked until locked_until timestamp passes

## Validation Rules

| Field | Rules | Custom Message |
|-------|-------|----------------|
| `email` | required, email, max_length:255, unique:users,email,is_deleted:false | Email is required and must be valid |
| `username` | alpha_numeric_underscore, min_length:3, max_length:30, unique:users,username,is_deleted:false | Username must be 3-30 characters (letters, numbers, underscores) |
| `password_hash` | required, min_length:60, max_length:255 | Password hash is required |
| `is_active` | boolean | Must be true or false |
| `is_deleted` | boolean | Must be true or false |
| `email_verified` | boolean | Must be true or false |

## Non-Functional Requirements

**Performance:**
- Read queries by ID must complete in < 10ms
- Email lookup queries must complete in < 50ms
- Write operations must complete in < 100ms
- Indexes must be maintained on high-cardinality fields

**Security:**
- Password hash must never be included in SELECT * queries used by API
- Use parameterized queries to prevent SQL injection
- Implement row-level security if using shared database

**Data Integrity:**
- Use database transactions for all write operations
- Implement optimistic locking with updated_at for concurrent updates
- Validate constraints at both application and database level

## AI Guidance

When implementing this entity:

1. **ORM Configuration**
   - Use proper entity decorators for fields
   - Configure indexes in migration files
   - Set up soft delete functionality
   - Implement beforeInsert/beforeUpdate hooks for timestamps

2. **Security**
   - Never select password_hash in API queries
   - Create separate DTO classes for API responses
   - Exclude sensitive fields in serialization
   - Hash passwords before insert/update

3. **Validation**
   - Validate email format at application level
   - Check username format with regex
   - Verify email uniqueness before insert
   - Handle constraint violations gracefully

4. **Testing**
   - Unit test unique constraints
   - Test soft delete behavior
   - Test account locking mechanism
   - Test concurrent update scenarios

5. **Migration**
   - Create migration for table creation
   - Add indexes in separate migration if needed
   - Include sample data in seeds
   - Document rollback procedure

**Sample ORM Entity (TypeScript/TypeORM):**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_user_email')
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
  @Index('idx_user_username')
  username?: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password_hash: string;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  @Index('idx_user_is_deleted')
  is_deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at?: Date;

  @Column({ type: 'integer', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
```
