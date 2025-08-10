import { z } from 'zod'

// User registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
})

// User login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
})

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  timezone: z.string().max(50, 'Timezone must be less than 50 characters').optional(),
})

// User management schema (for admin updates)
export const userUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
  timezone: z.string().max(50, 'Timezone must be less than 50 characters').optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
})

// Role assignment schema
export const roleAssignmentSchema = z.object({
  roleType: z.enum(['ADMIN', 'BUSINESS', 'SUPPLIER', 'STOCK_MANAGER', 'CLIENT', 'COMMAND_MANAGER', 'DELIVERY_DRIVER'], {
    message: 'Invalid role type'
  }),
  expiresAt: z.string().datetime().optional(),
})

// Role removal schema
export const roleRemovalSchema = z.object({
  roleType: z.enum(['ADMIN', 'BUSINESS', 'SUPPLIER', 'STOCK_MANAGER', 'CLIENT', 'COMMAND_MANAGER', 'DELIVERY_DRIVER'], {
    message: 'Invalid role type'
  }),
})

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
})

// Post creation schema
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().optional(),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  metaTitle: z.string().max(60, 'Meta title too long').optional(),
  metaDescription: z.string().max(160, 'Meta description too long').optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
})

// Category schema
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(200, 'Description too long').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
})

// Tag schema
export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(30, 'Tag name too long'),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(30, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
})

// Email template schema
export const createEmailTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(50, 'Template name too long'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().optional(),
  variables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
})

// Generic pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be positive').default(1),
  limit: z.coerce.number().min(1, 'Limit must be positive').max(100, 'Limit must be between 1 and 100').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  type: z.enum(['posts', 'users', 'categories', 'tags']).optional(),
})

// Validation helper function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}
