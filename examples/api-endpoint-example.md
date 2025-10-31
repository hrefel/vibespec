# Example: API Endpoint Requirement

This example demonstrates what a complete requirement specification looks like after being processed by VibeSpec CLI with constraint wizard.

---
id: API_ENDPOINT_lk8p4_a2f
type: api-endpoint
title: User Registration API Endpoint
domain: backend
priority: high
tags:
  - api-endpoint
  - backend
  - authentication
  - user-management
metadata:
  spec_version: 1.0.0
  generated_by: vibespec-cli
  generated_at: '2025-10-29T10:00:00.000Z'
  constraints_complete: true
  wizard_used: true
---

## Context

**Problem:** Users need to create accounts to access the platform. Currently there is no user registration endpoint.

**Background:** This is part of the authentication system overhaul. We are moving from social-only auth to support email/password registration.

**Assumptions:**
- Email verification will be implemented in a separate ticket
- Password reset functionality will come later
- We will use bcrypt for password hashing

## Business Constraints

### BC001 🔴 [MANDATORY]

**Rule:** Email must be unique across all users in the system

**Rationale:** Prevents duplicate accounts and ensures email can be used as primary identifier

**Examples:**
- Valid: New email "user@example.com" not in database
- Invalid: Email "existing@example.com" already registered

### BC002 🔴 [MANDATORY]

**Rule:** Password must be at least 8 characters and contain at least one uppercase letter, one number, and one special character

**Rationale:** Ensures minimum security standards for user accounts and protects against brute force attacks

### BC003 🟡 [RECOMMENDED]

**Rule:** Username should be between 3-30 characters and contain only alphanumeric characters and underscores

**Rationale:** Provides consistent user experience and prevents display issues with special characters

## Technical Constraints

### TC001 🔴 [MANDATORY]

**Rule:** API response time must be under 500ms for 95th percentile

**Rationale:** Ensures good user experience during registration process

### TC002 🔴 [MANDATORY]

**Rule:** Passwords must be hashed using bcrypt with minimum 10 salt rounds before storage

**Rationale:** Security best practice to protect user passwords in case of database breach

**Examples:**
- Never store plain text passwords
- Never use reversible encryption
- Always use bcrypt.hash() with salt rounds >= 10

### TC003 🔴 [MANDATORY]

**Rule:** API must return proper HTTP status codes: 201 for success, 400 for validation errors, 409 for duplicate email, 500 for server errors

**Rationale:** Follows REST API conventions and enables proper client-side error handling

### TC004 🟡 [RECOMMENDED]

**Rule:** Registration endpoint should be rate-limited to 5 requests per IP address per minute

**Rationale:** Prevents automated account creation and potential abuse

## Acceptance Criteria

### Criterion 1

- **Given:** A new user provides valid email and password
- **When:** They submit POST request to /api/auth/register
- **Then:** User account is created and 201 status is returned
- **And:** Response includes user ID and email
- **And:** Password is securely hashed in database

### Criterion 2

- **Given:** User provides an email that already exists
- **When:** They submit POST request to /api/auth/register
- **Then:** 409 status is returned
- **And:** Error message states "Email already exists"
- **And:** No new user record is created

### Criterion 3

- **Given:** User provides invalid password (too short or missing required characters)
- **When:** They submit POST request to /api/auth/register
- **Then:** 400 status is returned
- **And:** Error message specifies password requirements
- **And:** No user record is created

## Examples

### Valid Registration

**Input:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "username": "newuser"
}
```

**Output:**
```json
{
  "id": "uuid-v4-here",
  "email": "newuser@example.com",
  "username": "newuser",
  "created_at": "2025-10-29T10:00:00.000Z"
}
```

**Expected Behavior:** User account created successfully with 201 status code

### Duplicate Email [EDGE CASE]

**Input:**
```json
{
  "email": "existing@example.com",
  "password": "SecurePass123!",
  "username": "anotheruser"
}
```

**Output:**
```json
{
  "error": "Email already exists",
  "field": "email",
  "code": "DUPLICATE_EMAIL"
}
```

**Expected Behavior:** Registration rejected with 409 status code

### Weak Password [EDGE CASE]

**Input:**
```json
{
  "email": "user@example.com",
  "password": "weak",
  "username": "testuser"
}
```

**Output:**
```json
{
  "error": "Password does not meet requirements",
  "field": "password",
  "requirements": [
    "Minimum 8 characters",
    "At least one uppercase letter",
    "At least one number",
    "At least one special character"
  ],
  "code": "INVALID_PASSWORD"
}
```

**Expected Behavior:** Registration rejected with 400 status code

## API Contract

**Method:** `POST`
**Endpoint:** `/api/auth/register`
**Authentication:** none

### Request

**Body:**
```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 8 chars)",
  "username": "string (optional, 3-30 chars)"
}
```

### Responses

#### 201 - Created

```json
{
  "id": "string (uuid)",
  "email": "string",
  "username": "string",
  "created_at": "string (ISO 8601)"
}
```

#### 400 - Bad Request

```json
{
  "error": "string",
  "field": "string",
  "code": "string"
}
```

#### 409 - Conflict

```json
{
  "error": "Email already exists",
  "field": "email",
  "code": "DUPLICATE_EMAIL"
}
```

#### 500 - Internal Server Error

```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Validation Rules

| Field | Rules | Custom Message |
|-------|-------|----------------|
| `email` | required, email, max_length:255 | Please provide a valid email address |
| `password` | required, min_length:8, contains_uppercase, contains_number, contains_special | Password must be at least 8 characters with uppercase, number, and special character |
| `username` | alpha_numeric_underscore, min_length:3, max_length:30 | Username must be 3-30 characters (letters, numbers, underscores only) |

## Non-Functional Requirements

**Performance:** API must respond within 500ms for 95th percentile. Database queries should use indexes on email field.

**Security:** Passwords must be hashed using bcrypt with salt rounds >= 10. Never log passwords. Use HTTPS for all requests. Implement rate limiting per IP.

**Error Handling:** All validation errors must return consistent JSON format with error message, field name, and error code. Log all 500 errors for monitoring.

## AI Guidance

Focus on proper input validation, secure password hashing, and comprehensive error handling. Use a service layer to separate business logic from route handlers. Implement proper database transactions to ensure data consistency. Add logging for security events (registration attempts, failures). Consider implementing email verification in future iteration.

**Key Implementation Points:**
1. Validate all inputs before processing
2. Check email uniqueness with database query
3. Hash password using bcrypt before storage
4. Use try-catch blocks for database operations
5. Return consistent error format
6. Add proper TypeScript types for request/response
7. Write unit tests for validation logic
8. Write integration tests for endpoint
