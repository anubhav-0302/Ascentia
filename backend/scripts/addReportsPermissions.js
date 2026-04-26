#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path for cross-platform compatibility
const dbPath = path.resolve(__dirname, '..', 'dev.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// Reports permissions to add
const REPORTS_PERMISSIONS = {
  admin: [
    { module: 'reports', action: 'view', isEnabled: true },
    { module: 'reports', action: 'export', isEnabled: true }
  ],
  hr: [
    { module: 'reports', action: 'view', isEnabled: true },
    { module: 'reports', action: 'export', isEnabled: true }
  ],
  manager: [
    { module: 'reports', action: 'view', isEnabled: true },
    { module: 'reports', action: 'export', isEnabled: true }
  ],
  employee: [
    { module: 'reports', action: 'view', isEnabled: false },
    { module: 'reports', action: 'export', isEnabled: false }
  ]
};

async function addReportsPermissions() {
  try {
    console.log('🔧 Adding reports permissions to existing roles...');

    for (const [roleName, permissions] of Object.entries(REPORTS_PERMISSIONS)) {
      // Get the role
      const role = await prisma.roleConfig.findUnique({
        where: { name: roleName }
      });

      if (!role) {
        console.log(`⚠️ Role '${roleName}' not found, skipping...`);
        continue;
      }

      console.log(`\n📋 Processing role: ${roleName}`);

      for (const permission of permissions) {
        // Check if permission already exists
        const existing = await prisma.permission.findUnique({
          where: {
            roleId_module_action: {
              roleId: role.id,
              module: permission.module,
              action: permission.action
            }
          }
        });

        if (existing) {
          console.log(`  ✅ Permission '${permission.module}.${permission.action}' already exists`);
        } else {
          // Create the permission
          await prisma.permission.create({
            data: {
              roleId: role.id,
              module: permission.module,
              action: permission.action,
              isEnabled: permission.isEnabled
            }
          });
          console.log(`  ➕ Created permission '${permission.module}.${permission.action}' = ${permission.isEnabled}`);
        }
      }
    }

    console.log('\n✅ Reports permissions added successfully!');
  } catch (error) {
    console.error('❌ Error adding reports permissions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addReportsPermissions();
