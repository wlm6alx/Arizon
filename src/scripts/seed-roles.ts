#!/usr/bin/env tsx

/**
 * Role and Permission Seeder Script
 * 
 * This script initializes the database with default roles and permissions
 * for the RBAC system.
 * 
 * Usage: npx tsx src/scripts/seed-roles.ts
 */

import { seedRolesAndPermissions } from '../lib/rbac'
import { prisma } from '../lib/prisma'

async function main() {
  try {
    console.log('🌱 Starting role and permission seeding...')
    
    // Seed roles and permissions
    await seedRolesAndPermissions()
    
    console.log('✅ Role and permission seeding completed successfully!')
    
    // Display seeded data
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            userRoles: true
          }
        }
      }
    })
    
    console.log('\n📋 Seeded Roles:')
    roles.forEach(role => {
      console.log(`  • ${role.name} (${role.type})`)
      console.log(`    Description: ${role.description || 'No description'}`)
      console.log(`    Color: ${role.color}`)
      console.log(`    Permissions: ${role.permissions.length}`)
      console.log(`    Users: ${role._count.userRoles}`)
      console.log(`    Default: ${role.isDefault ? 'Yes' : 'No'}`)
      console.log('')
    })
    
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }]
    })
    
    console.log('🔐 Seeded Permissions:')
    const groupedPermissions = permissions.reduce((acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = []
      }
      acc[perm.resource].push(perm)
      return acc
    }, {} as Record<string, typeof permissions>)
    
    Object.entries(groupedPermissions).forEach(([resource, perms]) => {
      console.log(`  ${resource}:`)
      perms.forEach(perm => {
        console.log(`    • ${perm.action} - ${perm.description || perm.name}`)
      })
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeder
main()
