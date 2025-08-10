import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from './auth'
import { z } from 'zod'

// Types for middleware
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
  }
  ip?: string
}

export type MiddlewareHandler = (
  request: AuthenticatedRequest,
  response: NextResponse
) => Promise<NextResponse | void>

export type APIHandler = (
  request: AuthenticatedRequest
) => Promise<NextResponse>

// Error response helper
export function createErrorResponse(
  message: string,
  status: number = 400,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

// Success response helper
export function createSuccessResponse(
  data: unknown,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

// CORS middleware
export function corsMiddleware(): MiddlewareHandler {
  return async (request, response) => {
    const origin = request.headers.get('origin')
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
  }
}

// Rate limiting middleware (simple in-memory implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimitMiddleware(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): MiddlewareHandler {
  return async (request) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const key = `rate_limit:${ip}`

    const current = rateLimitStore.get(key)

    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
      return
    }

    if (current.count >= maxRequests) {
      return createErrorResponse(
        'Too many requests. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      )
    }

    current.count++
    rateLimitStore.set(key, current)
  }
}

// Authentication middleware
export function authMiddleware(required: boolean = true): MiddlewareHandler {
  return async (request) => {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      if (required) {
        return createErrorResponse(
          'Authentication required. Please provide a valid token.',
          401,
          'AUTH_TOKEN_MISSING'
        )
      }
      return
    }

    const session = await validateSession(token)

    if (!session) {
      if (required) {
        return createErrorResponse(
          'Invalid or expired token. Please login again.',
          401,
          'AUTH_TOKEN_INVALID'
        )
      }
      return
    }

    // Add user info to request
    ;(request as AuthenticatedRequest).user = session
  }
}

// Request validation middleware
export function validateRequestMiddleware<T>(
  schema: z.ZodSchema<T>,
  source: 'body' | 'query' | 'params' = 'body'
): MiddlewareHandler {
  return async (request) => {
    try {
      let data: unknown

      switch (source) {
        case 'body':
          data = await request.json()
          break
        case 'query':
          data = Object.fromEntries(new URL(request.url).searchParams.entries())
          break
        case 'params':
          // This would need to be handled differently in actual route handlers
          data = {}
          break
      }

      const result = schema.safeParse(data)

      if (!result.success) {
        const errors = result.error.issues.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        )
        return createErrorResponse(
          `Validation failed: ${errors.join(', ')}`,
          400,
          'VALIDATION_ERROR'
        )
      }

      // Store validated data in request for later use
      ;(request as AuthenticatedRequest & { validatedData: unknown }).validatedData = result.data
    } catch {
      return createErrorResponse(
        'Invalid request format',
        400,
        'INVALID_REQUEST_FORMAT'
      )
    }
  }
}

// Error handling middleware
export function errorHandlerMiddleware(): MiddlewareHandler {
  return async () => {
    // This middleware would wrap the entire request handling
    // In practice, this would be implemented at the route level
    return
  }
}

// Logging middleware
export function loggingMiddleware(): MiddlewareHandler {
  return async (request) => {
    const method = request.method
    const url = request.url
    const userAgent = request.headers.get('user-agent')
    const ip = request.ip || request.headers.get('x-forwarded-for')

    console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`)

    // In a real implementation, you'd want to log the response time after the request completes
    // This would require wrapping the response or using a different approach
  }
}

// Compose multiple middleware functions
export function composeMiddleware(...middlewares: MiddlewareHandler[]): MiddlewareHandler {
  return async (request, response) => {
    for (const middleware of middlewares) {
      const result = await middleware(request, response)
      if (result instanceof NextResponse) {
        return result
      }
    }
  }
}

// Helper function to get validated request data from middleware
export function getValidatedData<T = unknown>(request: NextRequest): T {
  const validatedData = (request as any).validatedData
  if (validatedData === undefined) {
    throw new Error('No validated data found. Make sure to use validateRequestMiddleware before calling getValidatedData.')
  }
  return validatedData as T
}

// Helper function to safely get validated data (returns null if not found)
export function getValidatedDataSafe<T = unknown>(request: NextRequest): T | null {
  const validatedData = (request as any).validatedData
  return validatedData !== undefined ? (validatedData as T) : null
}

// API route wrapper with middleware support
export function withMiddleware(
  handler: APIHandler,
  ...middlewares: MiddlewareHandler[]
) {
  return async (request: NextRequest) => {
    try {
      const response = NextResponse.next()
      const composedMiddleware = composeMiddleware(...middlewares)
      
      const middlewareResult = await composedMiddleware(request as AuthenticatedRequest, response)
      
      if (middlewareResult instanceof NextResponse) {
        return middlewareResult
      }

      return await handler(request as AuthenticatedRequest)
    } catch (error) {
      console.error('API Error:', error)
      return createErrorResponse(
        'Internal server error',
        500,
        'INTERNAL_SERVER_ERROR'
      )
    }
  }
}

// Method validation helper
export function validateMethod(request: NextRequest, allowedMethods: string[]): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return createErrorResponse(
      `Method ${request.method} not allowed`,
      405,
      'METHOD_NOT_ALLOWED'
    )
  }
  return null
}

// Content-Type validation helper
export function validateContentType(request: NextRequest, expectedType: string = 'application/json'): NextResponse | null {
  const contentType = request.headers.get('content-type')
  
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    if (!contentType || !contentType.includes(expectedType)) {
      return createErrorResponse(
        `Content-Type must be ${expectedType}`,
        400,
        'INVALID_CONTENT_TYPE'
      )
    }
  }
  
  return null
}
