---
id: FEATURE_task_mgmt_v1
type: feature
title: Real-Time Collaborative Task Management App
domain: fullstack
priority: high
tags:
  - fullstack
  - real-time
  - collaboration
  - task-management
metadata:
  spec_version: 1.0.0
  generated_by: vibespec-cli v6.0.0
  generated_at: '2025-10-29T11:00:00.000Z'
  constraints_complete: true
  wizard_used: true
---

## Context

**Problem:** Teams lack a real-time collaborative task management system that provides instant updates, mobile access, and comprehensive analytics for tracking team productivity.

**Background:** Current solutions lack real-time collaboration features, resulting in delayed communication, task conflicts, and reduced team efficiency. Teams need a system that updates instantly across all devices.

**Assumptions:**
- Users have modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Internet connection available (websocket requires active connection)
- AWS account available for S3 file storage
- SMTP server configured for email notifications
- PostgreSQL database for data persistence

## Scope

### In Scope
- User authentication and authorization
- Task CRUD operations with real-time sync
- Task assignment and reassignment
- Real-time conflict resolution
- Status and priority filtering
- Dashboard analytics
- Comment system with threading
- File attachments via S3
- Email notifications
- Mobile-responsive UI
- Dark mode theme

### Out of Scope
- Video/audio conferencing
- Time tracking functionality
- Gantt chart visualization
- Integration with third-party tools (Slack, JIRA)
- Calendar view
- Recurring tasks
- Task templates
- Advanced reporting (will be separate feature)

### Dependencies
- AWS S3 for file storage
- SMTP server for email
- PostgreSQL database
- WebSocket infrastructure

### Affected Components
- New system (no existing components affected)

## User Stories

### Story 1
**As a** team member
**I want to** see task updates in real-time
**So that** I always have the latest information without refreshing

### Story 2
**As a** project manager
**I want to** assign tasks to team members
**So that** work is distributed and tracked effectively

### Story 3
**As a** team member
**I want to** filter tasks by status, priority, and assignee
**So that** I can focus on relevant work

### Story 4
**As a** project manager
**I want to** view dashboard analytics
**So that** I can track team productivity and task completion rates

### Story 5
**As a** mobile user
**I want to** access tasks on my phone
**So that** I can stay updated while away from my desk

## Business Constraints

### BC001 🔴 [MANDATORY]

**Rule:** Only authenticated users can access the task management system

**Rationale:** Security requirement to protect team data and ensure proper user identification

**Examples:**
- Valid: User with valid JWT token can access tasks
- Invalid: Unauthenticated request to /api/tasks returns 401

### BC002 🔴 [MANDATORY]

**Rule:** Tasks can only be assigned to users who are members of the same team/workspace

**Rationale:** Prevents unauthorized access to tasks and maintains team boundaries

**Examples:**
- Valid: Assign task to team member within same workspace
- Invalid: Assign task to user from different workspace returns 403

### BC003 🔴 [MANDATORY]

**Rule:** Task priority must be one of: low, medium, high, urgent (case-insensitive)

**Rationale:** Standardizes priority levels for consistent filtering and sorting

**Examples:**
- Valid: priority = "high", "HIGH", "High"
- Invalid: priority = "critical", "very high" returns 400

### BC004 🔴 [MANDATORY]

**Rule:** Task status must be one of: todo, in-progress, completed (case-insensitive)

**Rationale:** Defines clear task lifecycle stages for tracking and filtering

**Examples:**
- Valid: status = "in-progress", "todo", "completed"
- Invalid: status = "pending", "done" returns 400

### BC005 🔴 [MANDATORY]

**Rule:** Users can only delete or edit tasks they created OR tasks assigned to them OR if they are team admin

**Rationale:** Prevents unauthorized modifications and maintains data integrity

**Examples:**
- Valid: Task creator can delete own task
- Valid: Team admin can edit any task
- Invalid: Regular user cannot delete other user's unassigned task

### BC006 🔴 [MANDATORY]

**Rule:** File attachments must be scanned for viruses before being made available for download

**Rationale:** Security requirement to protect users from malware

### BC007 🟡 [RECOMMENDED]

**Rule:** Task titles should be between 3-200 characters

**Rationale:** Ensures meaningful titles without excessive length

### BC008 🟡 [RECOMMENDED]

**Rule:** Email notifications should be sent within 5 minutes of task assignment or deadline approach

**Rationale:** Keeps users informed without overwhelming email frequency

### BC009 🔴 [MANDATORY]

**Rule:** Real-time updates must resolve conflicts using "last write wins" with timestamp comparison

**Rationale:** Prevents data inconsistency when multiple users edit same task simultaneously

**Examples:**
- User A edits task at 10:00:00
- User B edits same task at 10:00:01
- User B's changes win (newer timestamp)

### BC010 🔴 [MANDATORY]

**Rule:** Deleted tasks must be soft-deleted and retained for 30 days before permanent deletion

**Rationale:** Allows recovery from accidental deletions and supports audit requirements

## Technical Constraints

### TC001 🔴 [MANDATORY]

**Rule:** Real-time updates must propagate to all connected clients within 1 second (1000ms) for 95th percentile

**Rationale:** User experience requirement for "real-time" feeling

**Examples:**
- Measure latency from server emit to client receive
- 95% of messages must arrive within 1000ms

### TC002 🔴 [MANDATORY]

**Rule:** System must support minimum 100 concurrent users with stable WebSocket connections

**Rationale:** Scalability requirement for team collaboration

### TC003 🔴 [MANDATORY]

**Rule:** JWT access tokens must expire after 15 minutes, refresh tokens after 7 days

**Rationale:** Security best practice balancing usability and security

**Examples:**
- Access token: exp = 15 minutes
- Refresh token: exp = 7 days
- Require re-authentication after refresh token expiry

### TC004 🔴 [MANDATORY]

**Rule:** All API responses must include appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)

**Rationale:** RESTful API conventions for client error handling

### TC005 🔴 [MANDATORY]

**Rule:** Database queries must use prepared statements to prevent SQL injection

**Rationale:** Security requirement to prevent database attacks

### TC006 🔴 [MANDATORY]

**Rule:** File attachments must be limited to 10MB per file and 50MB total per task

**Rationale:** Prevents storage abuse and maintains reasonable S3 costs

**Examples:**
- Single file > 10MB: reject with 413
- Total attachments > 50MB: reject with 413

### TC007 🔴 [MANDATORY]

**Rule:** Mobile layout must be responsive from 320px to 2560px viewport width

**Rationale:** Support for mobile devices (iPhone SE at 320px) to large desktops

### TC008 🔴 [MANDATORY]

**Rule:** WebSocket connections must implement automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)

**Rationale:** Maintains connection stability during network interruptions

### TC009 🔴 [MANDATORY]

**Rule:** All timestamps must be stored in UTC and converted to user timezone on client

**Rationale:** Prevents timezone confusion for distributed teams

### TC010 🟡 [RECOMMENDED]

**Rule:** API endpoints should respond within 200ms for 95th percentile (excluding real-time WebSocket)

**Rationale:** Performance requirement for good user experience

### TC011 🔴 [MANDATORY]

**Rule:** Passwords must be hashed using bcrypt with minimum 10 salt rounds

**Rationale:** Security best practice for password storage

### TC012 🔴 [MANDATORY]

**Rule:** S3 file URLs must use pre-signed URLs with 1-hour expiration

**Rationale:** Security requirement to prevent unauthorized file access

### TC013 🟡 [RECOMMENDED]

**Rule:** Frontend should implement optimistic UI updates with rollback on failure

**Rationale:** Improves perceived performance while maintaining data consistency

### TC014 🔴 [MANDATORY]

**Rule:** Unit test coverage must reach minimum 80% for core business logic

**Rationale:** Quality assurance requirement to catch regressions

### TC015 🟡 [RECOMMENDED]

**Rule:** Dark mode should be implemented using CSS variables, not duplicate stylesheets

**Rationale:** Maintainability and performance consideration

## Acceptance Criteria

### Criterion 1: User Authentication

- **Given:** A new user provides valid email and password
- **When:** They submit the registration form
- **Then:** Account is created and they receive a JWT token
- **And:** Refresh token is stored securely (HttpOnly cookie)
- **And:** User is redirected to task dashboard

### Criterion 2: Real-Time Task Updates

- **Given:** Two users are viewing the same task
- **When:** User A updates the task title
- **Then:** User B sees the updated title within 1 second
- **And:** No page refresh is required
- **And:** Update notification appears in User B's UI

### Criterion 3: Task Creation

- **Given:** An authenticated user
- **When:** They create a new task with title, description, priority, and assignee
- **Then:** Task is created in database
- **And:** Real-time update is sent to all team members
- **And:** Assigned user receives email notification
- **And:** Task appears in dashboard with correct priority badge

### Criterion 4: Conflict Resolution

- **Given:** Two users edit the same task simultaneously
- **When:** Both submit changes within 1 second
- **Then:** Last write wins based on timestamp
- **And:** Losing user receives conflict notification
- **And:** Losing user's changes are discarded
- **And:** Winning user's changes are propagated to all clients

### Criterion 5: File Attachment

- **Given:** A user wants to attach a file to a task
- **When:** They upload a file (image or document) under 10MB
- **Then:** File is uploaded to S3 with virus scan
- **And:** Pre-signed URL is generated with 1-hour expiry
- **And:** File appears in task attachments list
- **And:** Other users can download the file via pre-signed URL

### Criterion 6: Mobile Responsiveness

- **Given:** A user accesses the app on a mobile device (320px width)
- **When:** They navigate to task list, task details, and dashboard
- **Then:** Layout adapts correctly without horizontal scrolling
- **And:** All buttons and inputs are touch-friendly (minimum 44px)
- **And:** Navigation menu collapses to hamburger menu

### Criterion 7: Dashboard Analytics

- **Given:** A project manager views the dashboard
- **When:** The dashboard loads
- **Then:** Displays task completion rate (%) for last 30 days
- **And:** Shows task distribution by status (pie chart)
- **And:** Lists top 5 team members by tasks completed
- **And:** Displays average task completion time

### Criterion 8: Dark Mode

- **Given:** A user toggles dark mode
- **When:** They click the dark mode switch
- **Then:** Theme changes immediately without page reload
- **And:** Preference is saved to localStorage
- **And:** Theme persists across browser sessions
- **And:** All components render correctly in dark theme

## Examples

### Example 1: Successful Task Creation

**Input:**
```json
POST /api/tasks
Authorization: Bearer <jwt_token>

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication with refresh tokens",
  "priority": "high",
  "status": "todo",
  "assignee_id": "user-123",
  "due_date": "2025-11-05T23:59:59Z"
}
```

**Output:**
```json
201 Created

{
  "id": "task-456",
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication with refresh tokens",
  "priority": "high",
  "status": "todo",
  "assignee": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "creator": {
    "id": "user-789",
    "name": "Jane Smith"
  },
  "due_date": "2025-11-05T23:59:59Z",
  "created_at": "2025-10-29T11:00:00Z",
  "updated_at": "2025-10-29T11:00:00Z"
}
```

**Expected Behavior:** Task created, WebSocket broadcast sent, email notification queued

### Example 2: Invalid Priority [EDGE CASE]

**Input:**
```json
POST /api/tasks
Authorization: Bearer <jwt_token>

{
  "title": "Fix bug",
  "priority": "critical",
  "status": "todo"
}
```

**Output:**
```json
400 Bad Request

{
  "error": "Invalid priority value",
  "field": "priority",
  "allowed_values": ["low", "medium", "high", "urgent"],
  "received": "critical"
}
```

**Expected Behavior:** Request rejected, no task created, error returned to client

### Example 3: Real-Time Update Conflict [EDGE CASE]

**Scenario:**
- User A starts editing task at 11:00:00.000
- User B starts editing same task at 11:00:00.100
- User A submits at 11:00:05.000
- User B submits at 11:00:05.500

**Expected Behavior:**
- User B's changes win (newer timestamp)
- User A receives WebSocket message:
```json
{
  "type": "conflict",
  "task_id": "task-456",
  "message": "Your changes were overwritten by a newer update",
  "winner": "User B",
  "timestamp": "2025-10-29T11:00:05.500Z"
}
```

### Example 4: File Upload Too Large [EDGE CASE]

**Input:**
```
POST /api/tasks/task-456/attachments
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: document.pdf (15MB)
```

**Output:**
```json
413 Payload Too Large

{
  "error": "File size exceeds maximum allowed",
  "max_size": "10MB",
  "received_size": "15MB",
  "code": "FILE_TOO_LARGE"
}
```

**Expected Behavior:** Upload rejected before S3 upload, no storage costs incurred

## Non-Functional Requirements

**Performance:**
- API response time < 200ms for 95th percentile
- WebSocket message delivery < 1000ms for 95th percentile
- Dashboard analytics calculation < 3 seconds
- Page load time < 2 seconds on 3G connection
- Support 100+ concurrent WebSocket connections

**Security:**
- JWT tokens with proper expiration
- Bcrypt password hashing (10+ salt rounds)
- S3 pre-signed URLs with 1-hour expiry
- SQL injection prevention via prepared statements
- XSS prevention via input sanitization
- HTTPS only in production
- CORS properly configured
- Rate limiting on authentication endpoints (5 attempts per 15 minutes)

**Scalability:**
- Horizontal scaling support for API servers
- WebSocket server clustering via Redis adapter
- Database connection pooling
- S3 for scalable file storage
- CDN for static assets

**Reliability:**
- WebSocket auto-reconnection with exponential backoff
- Database transactions for data consistency
- Error logging and monitoring
- Soft delete for data recovery
- Automated backups (daily)

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible
- Sufficient color contrast (4.5:1 for text)
- Touch targets minimum 44px

## AI Guidance

### Architecture Recommendations

1. **Real-Time Communication**
   - Use Socket.io with Redis adapter for multi-server scaling
   - Implement rooms per team/workspace for efficient broadcasting
   - Use binary protocols for low-latency messages
   - Implement message prioritization (user actions > notifications)

2. **Authentication Flow**
   ```typescript
   // Access token: 15 min expiry
   // Refresh token: 7 days expiry, HttpOnly cookie

   POST /api/auth/login → returns access + refresh tokens
   POST /api/auth/refresh → uses refresh token, returns new access token
   POST /api/auth/logout → invalidates refresh token
   ```

3. **Conflict Resolution**
   ```typescript
   interface TaskUpdate {
     task_id: string;
     updates: Partial<Task>;
     timestamp: number;
     user_id: string;
   }

   // Last write wins
   if (incomingUpdate.timestamp > currentTask.updated_at) {
     applyUpdate(incomingUpdate);
     broadcastToClients(incomingUpdate);
   } else {
     rejectUpdate({ reason: 'conflict', winner: currentTask.updated_by });
   }
   ```

4. **File Upload Flow**
   ```typescript
   // 1. Client requests upload URL
   GET /api/tasks/:id/upload-url → returns pre-signed S3 URL

   // 2. Client uploads directly to S3
   PUT <pre-signed-url> → file uploaded to S3

   // 3. Client confirms upload
   POST /api/tasks/:id/attachments → saves metadata in DB

   // 4. Virus scanning (async)
   S3 Lambda trigger → scan file → update status
   ```

5. **Database Schema**
   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     name VARCHAR(100) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Tasks table
   CREATE TABLE tasks (
     id UUID PRIMARY KEY,
     title VARCHAR(200) NOT NULL,
     description TEXT,
     priority VARCHAR(20) CHECK (priority IN ('low','medium','high','urgent')),
     status VARCHAR(20) CHECK (status IN ('todo','in-progress','completed')),
     assignee_id UUID REFERENCES users(id),
     creator_id UUID REFERENCES users(id),
     due_date TIMESTAMP,
     is_deleted BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     deleted_at TIMESTAMP
   );

   CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
   CREATE INDEX idx_tasks_status ON tasks(status);
   CREATE INDEX idx_tasks_priority ON tasks(priority);
   ```

6. **Dark Mode Implementation**
   ```css
   /* CSS Variables approach */
   :root {
     --bg-primary: #ffffff;
     --text-primary: #000000;
     --border-color: #e5e7eb;
   }

   [data-theme="dark"] {
     --bg-primary: #1f2937;
     --text-primary: #ffffff;
     --border-color: #374151;
   }
   ```

7. **Error Handling**
   ```typescript
   // Consistent error format
   interface APIError {
     error: string;
     field?: string;
     code: string;
     details?: any;
   }

   // Use specific error codes
   - AUTH_INVALID_TOKEN
   - TASK_NOT_FOUND
   - FILE_TOO_LARGE
   - CONFLICT_DETECTED
   ```

### Testing Strategy

1. **Unit Tests** (80% coverage)
   - Authentication logic
   - Task CRUD operations
   - Conflict resolution algorithm
   - Validation functions

2. **Integration Tests**
   - API endpoints
   - WebSocket events
   - Database transactions
   - S3 file operations

3. **E2E Tests**
   - User login flow
   - Task creation and real-time sync
   - File upload and download
   - Mobile responsiveness

4. **Load Tests**
   - 100+ concurrent WebSocket connections
   - Measure latency under load
   - Database query performance
   - S3 upload throughput

### Deployment Considerations

- Use environment variables for configuration
- Implement health check endpoints
- Configure WebSocket sticky sessions with load balancer
- Set up Redis for WebSocket scaling
- Configure S3 bucket policies for security
- Set up CloudWatch/monitoring for production
- Implement graceful shutdown for WebSocket connections
- Use database migrations for schema changes
