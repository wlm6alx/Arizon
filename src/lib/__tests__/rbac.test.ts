import { 
  getUserWithRoles, 
  getUserPermissions, 
  hasPermission, 
  hasRole, 
  isAdmin, 
  assignRole, 
  removeRole, 
  getAllRoles,
  getDefaultRole,
  seedRolesAndPermissions
} from '../rbac'
import { prisma } from '../prisma'
import { RoleType } from '@prisma/client'
import { setupTestDatabase, cleanupTestDatabase, createTestUser } from '../test-utils'

describe('RBAC System', () => {
  beforeAll(async () => {
    await setupTestDatabase()
    await seedRolesAndPermissions()
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.userRole.deleteMany()
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    })
  })

  describe('Role Assignment and Retrieval', () => {
    it('should assign and retrieve user roles', async () => {
      const user = await createTestUser()
      
      // Assign admin role
      const assigned = await assignRole(user.id, RoleType.ADMIN)
      expect(assigned).toBe(true)

      // Get user with roles
      const userWithRoles = await getUserWithRoles(user.id)
      expect(userWithRoles).toBeTruthy()
      expect(userWithRoles?.userRoles).toHaveLength(1)
      expect(userWithRoles?.userRoles[0].role.type).toBe(RoleType.ADMIN)
    })

    it('should handle multiple role assignments', async () => {
      const user = await createTestUser()
      
      // Assign multiple roles
      await assignRole(user.id, RoleType.BUSINESS)
      await assignRole(user.id, RoleType.CLIENT)

      const userWithRoles = await getUserWithRoles(user.id)
      expect(userWithRoles?.userRoles).toHaveLength(2)
      
      const roleTypes = userWithRoles?.userRoles.map(ur => ur.role.type)
      expect(roleTypes).toContain(RoleType.BUSINESS)
      expect(roleTypes).toContain(RoleType.CLIENT)
    })

    it('should remove user roles', async () => {
      const user = await createTestUser()
      
      // Assign and then remove role
      await assignRole(user.id, RoleType.SUPPLIER)
      await removeRole(user.id, RoleType.SUPPLIER)

      const userWithRoles = await getUserWithRoles(user.id)
      const activeRoles = userWithRoles?.userRoles.filter(ur => ur.isActive)
      expect(activeRoles).toHaveLength(0)
    })

    it('should handle role expiration', async () => {
      const user = await createTestUser()
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      
      // Assign expired role
      await assignRole(user.id, RoleType.DELIVERY_DRIVER, user.id, pastDate)

      const userWithRoles = await getUserWithRoles(user.id)
      expect(userWithRoles?.userRoles).toHaveLength(0) // Should filter out expired roles
    })
  })

  describe('Permission Checking', () => {
    it('should check user permissions correctly', async () => {
      const user = await createTestUser()
      await assignRole(user.id, RoleType.ADMIN)

      // Admin should have all permissions
      const canReadUsers = await hasPermission(user.id, 'users', 'read')
      const canManageRoles = await hasPermission(user.id, 'roles', 'manage')
      
      expect(canReadUsers).toBe(true)
      expect(canManageRoles).toBe(true)
    })

    it('should return false for non-existent permissions', async () => {
      const user = await createTestUser()
      await assignRole(user.id, RoleType.CLIENT)

      const canDeleteUsers = await hasPermission(user.id, 'users', 'delete')
      expect(canDeleteUsers).toBe(false)
    })

    it('should get all user permissions', async () => {
      const user = await createTestUser()
      await assignRole(user.id, RoleType.ADMIN)

      const permissions = await getUserPermissions(user.id)
      expect(permissions.length).toBeGreaterThan(0)
      
      // Check that permissions have required properties
      permissions.forEach(permission => {
        expect(permission).toHaveProperty('id')
        expect(permission).toHaveProperty('name')
        expect(permission).toHaveProperty('resource')
        expect(permission).toHaveProperty('action')
      })
    })
  })

  describe('Role Checking', () => {
    it('should check if user has specific roles', async () => {
      const user = await createTestUser()
      await assignRole(user.id, RoleType.BUSINESS)

      const hasBusiness = await hasRole(user.id, [RoleType.BUSINESS])
      const hasAdmin = await hasRole(user.id, [RoleType.ADMIN])
      
      expect(hasBusiness).toBe(true)
      expect(hasAdmin).toBe(false)
    })

    it('should check admin status', async () => {
      const adminUser = await createTestUser()
      const regularUser = await createTestUser()
      
      await assignRole(adminUser.id, RoleType.ADMIN)
      await assignRole(regularUser.id, RoleType.CLIENT)

      const adminCheck = await isAdmin(adminUser.id)
      const regularCheck = await isAdmin(regularUser.id)
      
      expect(adminCheck).toBe(true)
      expect(regularCheck).toBe(false)
    })

    it('should handle multiple role checks', async () => {
      const user = await createTestUser()
      await assignRole(user.id, RoleType.STOCK_MANAGER)

      const hasManagerRoles = await hasRole(user.id, [RoleType.STOCK_MANAGER, RoleType.COMMAND_MANAGER])
      const hasClientRoles = await hasRole(user.id, [RoleType.CLIENT])
      
      expect(hasManagerRoles).toBe(true)
      expect(hasClientRoles).toBe(false)
    })
  })

  describe('Role Management', () => {
    it('should get all available roles', async () => {
      const roles = await getAllRoles()
      
      expect(roles.length).toBeGreaterThan(0)
      expect(roles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: RoleType.ADMIN,
            name: expect.any(String)
          }),
          expect.objectContaining({
            type: RoleType.CLIENT,
            name: expect.any(String)
          })
        ])
      )
    })

    it('should get default role', async () => {
      const defaultRole = await getDefaultRole()
      
      expect(defaultRole).toBeTruthy()
      expect(defaultRole?.type).toBe(RoleType.CLIENT) // CLIENT should be default
    })

    it('should handle non-existent users gracefully', async () => {
      const fakeUserId = 'non-existent-user-id'
      
      const userWithRoles = await getUserWithRoles(fakeUserId)
      const permissions = await getUserPermissions(fakeUserId)
      const hasAdminRole = await isAdmin(fakeUserId)
      
      expect(userWithRoles).toBeNull()
      expect(permissions).toEqual([])
      expect(hasAdminRole).toBe(false)
    })
  })

  describe('Role Assignment Edge Cases', () => {
    it('should handle reassigning the same role', async () => {
      const user = await createTestUser()
      
      // Assign role twice
      const firstAssignment = await assignRole(user.id, RoleType.SUPPLIER)
      const secondAssignment = await assignRole(user.id, RoleType.SUPPLIER)
      
      expect(firstAssignment).toBe(true)
      expect(secondAssignment).toBe(true)

      const userWithRoles = await getUserWithRoles(user.id)
      expect(userWithRoles?.userRoles).toHaveLength(1)
    })

    it('should handle invalid role types', async () => {
      const user = await createTestUser()
      
      // This should be handled by TypeScript, but test runtime behavior
      const result = await assignRole(user.id, 'INVALID_ROLE' as RoleType)
      expect(result).toBe(false)
    })

    it('should handle removing non-existent roles', async () => {
      const user = await createTestUser()
      
      const result = await removeRole(user.id, RoleType.ADMIN)
      expect(result).toBe(true) // Should succeed even if role wasn't assigned
    })
  })

  describe('Permission Inheritance', () => {
    it('should not have duplicate permissions from multiple roles', async () => {
      const user = await createTestUser()
      
      // Assign roles that might have overlapping permissions
      await assignRole(user.id, RoleType.ADMIN)
      await assignRole(user.id, RoleType.BUSINESS)

      const permissions = await getUserPermissions(user.id)
      const permissionIds = permissions.map(p => p.id)
      const uniquePermissionIds = [...new Set(permissionIds)]
      
      expect(permissionIds.length).toBe(uniquePermissionIds.length)
    })
  })
})
