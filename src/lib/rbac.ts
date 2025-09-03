/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from './prisma'
import { RoleType } from '@prisma/client'

export interface UserWithRoles {
  id: string
  email: string
  userRoles: {
    role: {
      id: string
      name: string
      type: RoleType
      isActive: boolean
    }
    isActive: boolean
    expiresAt: Date | null
    assignedAt: Date
  }[]
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string | null
}

export interface RoleWithPermissions {
  id: string
  name: string
  type: RoleType
  permissions: {
    permission: Permission
    isGranted: boolean
    conditions?: any
  }[]
}

/**
 * Get user with their active roles
 */
export async function getUserWithRoles(userId: string): Promise<UserWithRoles | null> {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      userRoles: {
        where: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        select: {
          isActive: true,
          expiresAt: true,
          assignedAt: true,
          role: {
            select: {
              id: true,
              name: true,
              type: true,
              isActive: true
            }
          }
        }
      }
    }
  })
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const userWithRoles = await getUserWithRoles(userId)
  if (!userWithRoles) return []

  const activeRoleIds = userWithRoles.userRoles
    .filter(ur => ur.role.isActive)
    .map(ur => ur.role.id)

  if (activeRoleIds.length === 0) return []

  const rolePermissions = await prisma.rolePermission.findMany({
    where: {
      roleId: { in: activeRoleIds },
      isGranted: true
    },
    include: {
      permission: true
    }
  })

  // Remove duplicates and return unique permissions
  const uniquePermissions = new Map<string, Permission>()
  rolePermissions.forEach(rp => {
    uniquePermissions.set(rp.permission.id, rp.permission)
  })

  return Array.from(uniquePermissions.values())
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissions.some(p => p.resource === resource && p.action === action)
}

/**
 * Check if user has any of the specified roles
 */
export async function hasRole(userId: string, roleTypes: RoleType[]): Promise<boolean> {
  const userWithRoles = await getUserWithRoles(userId)
  if (!userWithRoles) return false

  return userWithRoles.userRoles.some(ur => 
    ur.role.isActive && roleTypes.includes(ur.role.type)
  )
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return await hasRole(userId, [RoleType.ADMIN])
}

/**
 * Assign role to user
 */
export async function assignRole(
  userId: string,
  roleType: RoleType,
  assignedBy?: string,
  expiresAt?: Date
): Promise<boolean> {
  try {
    // Find the role
    const role = await prisma.role.findUnique({
      where: { type: roleType }
    })

    if (!role || !role.isActive) {
      return false
    }

    // Check if user already has this role
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id
        }
      }
    })

    if (existingUserRole) {
      // Update existing role assignment
      await prisma.userRole.update({
        where: { id: existingUserRole.id },
        data: {
          isActive: true,
          assignedBy,
          assignedAt: new Date(),
          expiresAt
        }
      })
    } else {
      // Create new role assignment
      await prisma.userRole.create({
        data: {
          userId,
          roleId: role.id,
          assignedBy,
          expiresAt,
          isActive: true
        }
      })
    }

    return true
  } catch (error) {
    console.error('Error assigning role:', error)
    return false
  }
}

/**
 * Remove role from user
 */
export async function removeRole(userId: string, roleType: RoleType): Promise<boolean> {
  try {
    const role = await prisma.role.findUnique({
      where: { type: roleType }
    })

    if (!role) return false

    await prisma.userRole.updateMany({
      where: {
        userId,
        roleId: role.id
      },
      data: {
        isActive: false
      }
    })

    return true
  } catch (error) {
    console.error('Error removing role:', error)
    return false
  }
}

/**
 * Get all available roles
 */
export async function getAllRoles(): Promise<RoleWithPermissions[]> {
  return await prisma.role.findMany({
    where: { isActive: true },
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  })
}

/**
 * Create default roles and permissions
 */
export async function seedRolesAndPermissions(): Promise<void> {
  console.log('Seeding roles and permissions...')

  // Define default roles
  const defaultRoles = [
    {
      name: 'Administrator',
      type: RoleType.ADMIN,
      description: 'Full system access and management',
      color: '#DC2626',
      isDefault: false
    },
    {
      name: 'Business Manager',
      type: RoleType.BUSINESS,
      description: 'Business operations and management',
      color: '#7C3AED',
      isDefault: false
    },
    {
      name: 'Supplier',
      type: RoleType.SUPPLIER,
      description: 'Product supplier and inventory management',
      color: '#059669',
      isDefault: false
    },
    {
      name: 'Stock Manager',
      type: RoleType.STOCK_MANAGER,
      description: 'Inventory and stock management',
      color: '#EA580C',
      isDefault: false
    },
    {
      name: 'Client',
      type: RoleType.CLIENT,
      description: 'Customer with purchasing capabilities',
      color: '#0284C7',
      isDefault: true
    },
    {
      name: 'Command Manager',
      type: RoleType.COMMAND_MANAGER,
      description: 'Order and command management',
      color: '#DB2777',
      isDefault: false
    },
    {
      name: 'Delivery Driver',
      type: RoleType.DELIVERY_DRIVER,
      description: 'Package delivery and logistics',
      color: '#65A30D',
      isDefault: false
    }
  ]

  // Create roles
  for (const roleData of defaultRoles) {
    await prisma.role.upsert({
      where: { type: roleData.type },
      update: roleData,
      create: roleData
    })
  }

  // Define default permissions
  const defaultPermissions = [
    // User management
    { name: 'Create Users', resource: 'users', action: 'create', description: 'Create new user accounts' },
    { name: 'Read Users', resource: 'users', action: 'read', description: 'View user information' },
    { name: 'Update Users', resource: 'users', action: 'update', description: 'Modify user accounts' },
    { name: 'Delete Users', resource: 'users', action: 'delete', description: 'Remove user accounts' },
    
    // Role management
    { name: 'Manage Roles', resource: 'roles', action: 'manage', description: 'Assign and remove user roles' },
    { name: 'Read Roles', resource: 'roles', action: 'read', description: 'View role information' },
    
    // Profile management
    { name: 'Update Profile', resource: 'profile', action: 'update', description: 'Update own profile' },
    { name: 'Read Profile', resource: 'profile', action: 'read', description: 'View own profile' },
    
    // System administration
    { name: 'System Settings', resource: 'system', action: 'manage', description: 'Manage system settings' },
    { name: 'View Analytics', resource: 'analytics', action: 'read', description: 'View system analytics' },
    
    // Content management
    { name: 'Create Posts', resource: 'posts', action: 'create', description: 'Create new posts' },
    { name: 'Read Posts', resource: 'posts', action: 'read', description: 'View posts' },
    { name: 'Update Posts', resource: 'posts', action: 'update', description: 'Modify posts' },
    { name: 'Delete Posts', resource: 'posts', action: 'delete', description: 'Remove posts' },
    
    // Chat management
    { name: 'Create Chats', resource: 'chats', action: 'create', description: 'Create new chat rooms' },
    { name: 'Read Chats', resource: 'chats', action: 'read', description: 'View chat rooms and messages' },
    { name: 'Update Chats', resource: 'chats', action: 'update', description: 'Modify chat room settings' },
    { name: 'Delete Chats', resource: 'chats', action: 'delete', description: 'Remove chat rooms' },
    { name: 'Join Private Chats', resource: 'chats', action: 'join_private', description: 'Join private chat rooms' },
    { name: 'Moderate Chats', resource: 'chats', action: 'moderate', description: 'Moderate chat messages and users' },
  ]

  // Create permissions
  for (const permData of defaultPermissions) {
    await prisma.permission.upsert({
      where: { 
        resource_action: {
          resource: permData.resource,
          action: permData.action
        }
      },
      update: permData,
      create: permData
    })
  }

  // Assign permissions to roles
  const adminRole = await prisma.role.findUnique({ where: { type: RoleType.ADMIN } })
  const clientRole = await prisma.role.findUnique({ where: { type: RoleType.CLIENT } })

  if (adminRole) {
    // Admin gets all permissions
    const allPermissions = await prisma.permission.findMany()
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id
          }
        },
        update: { isGranted: true },
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
          isGranted: true
        }
      })
    }
  }

  if (clientRole) {
    // Client gets basic permissions
    const clientPermissions = await prisma.permission.findMany({
      where: {
        OR: [
          { resource: 'profile', action: 'read' },
          { resource: 'profile', action: 'update' },
          { resource: 'posts', action: 'read' }
        ]
      }
    })

    for (const permission of clientPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: clientRole.id,
            permissionId: permission.id
          }
        },
        update: { isGranted: true },
        create: {
          roleId: clientRole.id,
          permissionId: permission.id,
          isGranted: true
        }
      })
    }
  }

  console.log('Roles and permissions seeded successfully!')
}

/**
 * Get default role for new users
 */
export async function getDefaultRole(): Promise<{ id: string; type: RoleType } | null> {
  const defaultRole = await prisma.role.findFirst({
    where: { 
      isDefault: true,
      // isActive: true 
    },
    select: {
      id: true,
      type: true
    }
  })

  return defaultRole
}
