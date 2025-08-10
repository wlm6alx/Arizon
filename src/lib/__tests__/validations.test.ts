import {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  emailVerificationSchema,
  updateProfileSchema,
  changePasswordSchema,
  createPostSchema,
  createCategorySchema,
  createTagSchema,
  createEmailTemplateSchema,
  paginationSchema,
  searchSchema,
  validateData
} from '../validations'

describe('Validation Schemas', () => {
  describe('User Registration Schema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe'
      }

      const result = validateData(registerSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      }

      const result = validateData(registerSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('email: Invalid email address')
      }
    })

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe'
      }

      const result = validateData(registerSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(error => error.includes('Password must be at least 8 characters'))).toBe(true)
      }
    })

    it('should reject password without uppercase, lowercase, and number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe'
      }

      const result = validateData(registerSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(error => error.includes('Password must contain'))).toBe(true)
      }
    })

    it('should reject invalid username characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        username: 'john-doe!'
      }

      const result = validateData(registerSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(error => error.includes('Username can only contain'))).toBe(true)
      }
    })

    it('should accept registration without username', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      }

      const result = validateData(registerSchema, validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Login Schema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = validateData(loginSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      }

      const result = validateData(loginSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('email: Invalid email address')
      }
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      }

      const result = validateData(loginSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('password: Password is required')
      }
    })
  })

  describe('Password Reset Schemas', () => {
    it('should validate password reset request', () => {
      const validData = { email: 'test@example.com' }

      const result = validateData(passwordResetRequestSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should validate password reset', () => {
      const validData = {
        token: 'valid-reset-token',
        password: 'NewPassword123'
      }

      const result = validateData(passwordResetSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should reject password reset without token', () => {
      const invalidData = {
        token: '',
        password: 'NewPassword123'
      }

      const result = validateData(passwordResetSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('token: Reset token is required')
      }
    })
  })

  describe('Profile Update Schema', () => {
    it('should validate profile update data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        avatar: 'https://example.com/avatar.jpg'
      }

      const result = validateData(updateProfileSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should accept partial profile updates', () => {
      const validData = {
        firstName: 'John'
      }

      const result = validateData(updateProfileSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should reject invalid avatar URL', () => {
      const invalidData = {
        firstName: 'John',
        avatar: 'not-a-url'
      }

      const result = validateData(updateProfileSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('avatar: Invalid avatar URL')
      }
    })
  })

  describe('Post Creation Schema', () => {
    it('should validate post creation data', () => {
      const validData = {
        title: 'Test Post',
        content: 'This is test content',
        excerpt: 'Test excerpt',
        slug: 'test-post',
        published: true,
        featured: false,
        metaTitle: 'Test Meta Title',
        metaDescription: 'Test meta description',
        categoryIds: ['cat1', 'cat2'],
        tagIds: ['tag1', 'tag2']
      }

      const result = validateData(createPostSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should validate minimal post data', () => {
      const validData = {
        title: 'Test Post',
        slug: 'test-post'
      }

      const result = validateData(createPostSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('Test Post')
        expect(result.data.slug).toBe('test-post')
        expect(result.data.published).toBe(false) // default value
        expect(result.data.featured).toBe(false) // default value
      }
    })

    it('should reject invalid slug format', () => {
      const invalidData = {
        title: 'Test Post',
        slug: 'Invalid Slug!'
      }

      const result = validateData(createPostSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(error => error.includes('Slug can only contain'))).toBe(true)
      }
    })

    it('should reject too long meta description', () => {
      const invalidData = {
        title: 'Test Post',
        slug: 'test-post',
        metaDescription: 'a'.repeat(200) // Too long
      }

      const result = validateData(createPostSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(error => error.includes('Meta description too long'))).toBe(true)
      }
    })
  })

  describe('Category and Tag Schemas', () => {
    it('should validate category creation', () => {
      const validData = {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech-related posts',
        color: '#FF5733'
      }

      const result = validateData(createCategorySchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should validate tag creation', () => {
      const validData = {
        name: 'JavaScript',
        slug: 'javascript',
        color: '#F7DF1E'
      }

      const result = validateData(createTagSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should reject invalid color format', () => {
      const invalidData = {
        name: 'Technology',
        slug: 'technology',
        color: 'red' // Invalid hex format
      }

      const result = validateData(createCategorySchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(error => error.includes('Invalid color format'))).toBe(true)
      }
    })
  })

  describe('Email Template Schema', () => {
    it('should validate email template creation', () => {
      const validData = {
        name: 'welcome-email',
        subject: 'Welcome {{name}}!',
        htmlContent: '<h1>Welcome {{name}}!</h1>',
        textContent: 'Welcome {{name}}!',
        variables: { name: 'John Doe' }
      }

      const result = validateData(createEmailTemplateSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should validate minimal email template', () => {
      const validData = {
        name: 'simple-email',
        subject: 'Simple Email',
        htmlContent: '<p>Simple content</p>'
      }

      const result = validateData(createEmailTemplateSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('simple-email')
        expect(result.data.subject).toBe('Simple Email')
        expect(result.data.htmlContent).toBe('<p>Simple content</p>')
      }
    })
  })

  describe('Pagination Schema', () => {
    it('should validate pagination parameters', () => {
      const validData = {
        page: '2',
        limit: '20',
        sortBy: 'createdAt',
        sortOrder: 'asc' as const
      }

      const result = validateData(paginationSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2) // Should be converted to number
        expect(result.data.limit).toBe(20) // Should be converted to number
        expect(result.data.sortBy).toBe('createdAt')
        expect(result.data.sortOrder).toBe('asc')
      }
    })

    it('should use default values', () => {
      const validData = {}

      const result = validateData(paginationSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1) // Default value
        expect(result.data.limit).toBe(10) // Default value
        expect(result.data.sortOrder).toBe('desc') // Default value
      }
    })

    it('should reject invalid page number', () => {
      const invalidData = {
        page: '0'
      }

      const result = validateData(paginationSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(error => error.includes('Page must be positive'))).toBe(true)
      }
    })

    it('should reject limit too high', () => {
      const invalidData = {
        limit: '200'
      }

      const result = validateData(paginationSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(error => error.includes('Limit must be between 1 and 100'))).toBe(true)
      }
    })
  })

  describe('Search Schema', () => {
    it('should validate search parameters', () => {
      const validData = {
        query: 'javascript tutorial',
        type: 'posts' as const
      }

      const result = validateData(searchSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should validate search without type', () => {
      const validData = {
        query: 'javascript tutorial'
      }

      const result = validateData(searchSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.query).toBe('javascript tutorial')
        expect(result.data.type).toBeUndefined()
      }
    })

    it('should reject empty query', () => {
      const invalidData = {
        query: ''
      }

      const result = validateData(searchSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('query: Search query is required')
      }
    })

    it('should reject invalid search type', () => {
      const invalidData = {
        query: 'test',
        type: 'invalid-type'
      }

      const result = validateData(searchSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(error => error.includes('type'))).toBe(true)
      }
    })
  })

  describe('validateData Helper Function', () => {
    it('should handle validation errors correctly', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      }

      const result = validateData(loginSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toHaveLength(2)
        expect(result.errors).toContain('email: Invalid email address')
        expect(result.errors).toContain('password: Password is required')
      }
    })

    it('should handle non-ZodError exceptions', () => {
      // Create a schema that will throw a non-Zod error
      const problematicSchema = {
        parse: () => {
          throw new Error('Non-Zod error')
        }
      } as any

      const result = validateData(problematicSchema, {})
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toEqual(['Validation failed'])
      }
    })
  })
})
