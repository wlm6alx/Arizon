# Arizon API Documentation

## Overview

The Arizon backend provides a comprehensive user management system with role-based access control (RBAC), authentication, and email services. Built with Next.js 15, TypeScript, Prisma ORM, and PostgreSQL.

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
http://localhost:3000/api
```

## Authentication Endpoints

### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "emailVerified": null,
      "isActive": true
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

### POST /auth/logout
Logout user and invalidate session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## User Profile Management

### GET /users/profile
Get current user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg",
      "phone": "+1234567890",
      "bio": "Software developer",
      "address": "123 Main St",
      "city": "New York",
      "country": "USA",
      "timezone": "America/New_York",
      "emailVerified": "2024-01-01T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "userRoles": [
        {
          "id": "role_assignment_id",
          "assignedAt": "2024-01-01T00:00:00.000Z",
          "expiresAt": null,
          "role": {
            "id": "role_id",
            "name": "Client",
            "type": "CLIENT",
            "description": "Customer with purchasing capabilities",
            "color": "#0284C7"
          }
        }
      ]
    }
  }
}
```

### PUT /users/profile
Update current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "username": "janesmith",
  "avatar": "https://example.com/new-avatar.jpg",
  "phone": "+1987654321",
  "bio": "Updated bio",
  "address": "456 Oak Ave",
  "city": "Los Angeles",
  "country": "USA",
  "timezone": "America/Los_Angeles"
}
```

## User Management (Admin Only)

### GET /users
Get list of all users with pagination and filtering.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `users:read` or Admin role

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search in email, firstName, lastName, username
- `role` (string): Filter by role type
- `status` (string): Filter by status (active/inactive)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "email": "user@example.com",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar.jpg",
        "emailVerified": "2024-01-01T00:00:00.000Z",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "userRoles": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /users/{id}
Get specific user by ID.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `users:read` or Admin role (or own profile)

### PUT /users/{id}
Update specific user (Admin only).

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `users:update` or Admin role

**Request Body:**
```json
{
  "firstName": "Updated Name",
  "isActive": false,
  "emailVerified": true
}
```

### DELETE /users/{id}
Deactivate user account (Admin only).

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `users:delete` or Admin role

## Role Management

### GET /roles
Get all available roles with their permissions.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `roles:read` or Admin role

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "role_id",
        "name": "Administrator",
        "type": "ADMIN",
        "description": "Full system access and management",
        "color": "#DC2626",
        "isActive": true,
        "isDefault": false,
        "permissions": [
          {
            "permission": {
              "id": "perm_id",
              "name": "Create Users",
              "resource": "users",
              "action": "create",
              "description": "Create new user accounts"
            },
            "isGranted": true
          }
        ]
      }
    ]
  }
}
```

### GET /users/{id}/roles
Get roles assigned to a specific user.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `roles:manage` or Admin role (or own profile)

### POST /users/{id}/roles
Assign role to user.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `roles:manage` or Admin role

**Request Body:**
```json
{
  "roleType": "BUSINESS",
  "expiresAt": "2024-12-31T23:59:59.000Z" // optional
}
```

### DELETE /users/{id}/roles
Remove role from user.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** `roles:manage` or Admin role

**Request Body:**
```json
{
  "roleType": "BUSINESS"
}
```

## Available Roles

1. **ADMIN** - Administrator
   - Full system access and management
   - Color: #DC2626

2. **BUSINESS** - Business Manager
   - Business operations and management
   - Color: #7C3AED

3. **SUPPLIER** - Supplier
   - Product supplier and inventory management
   - Color: #059669

4. **STOCK_MANAGER** - Stock Manager
   - Inventory and stock management
   - Color: #EA580C

5. **CLIENT** - Client (Default)
   - Customer with purchasing capabilities
   - Color: #0284C7

6. **COMMAND_MANAGER** - Command Manager
   - Order and command management
   - Color: #DB2777

7. **DELIVERY_DRIVER** - Delivery Driver
   - Package delivery and logistics
   - Color: #65A30D

## Permissions System

The system uses a resource-action based permission model:

### Resources:
- `users` - User management
- `roles` - Role management
- `profile` - Profile management
- `posts` - Content management
- `system` - System administration
- `analytics` - Analytics and reporting

### Actions:
- `create` - Create new items
- `read` - View/read items
- `update` - Modify existing items
- `delete` - Remove items
- `manage` - Full management access

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid request data
- `USER_NOT_FOUND` - User does not exist
- `ROLE_ASSIGNMENT_FAILED` - Role assignment failed
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

- Signup: 5 attempts per 15 minutes
- Login: 10 attempts per 15 minutes
- Other endpoints: Standard rate limiting applies

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Session management
- CORS protection
- Request validation with Zod
- SQL injection protection via Prisma
- Role-based access control
- Rate limiting
- Input sanitization

## Database Seeding

To initialize roles and permissions:

```bash
npx tsx src/scripts/seed-roles.ts
```

This will create all default roles and their associated permissions.
