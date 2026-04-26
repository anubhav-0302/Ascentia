/**
 * SYNC PERMISSIONS — Idempotent startup hook
 * ────────────────────────────────────────────────────────────────────────────
 * Runs on every server startup. Reconciles the DB with the canonical
 * permission registry without ever destroying existing role customizations.
 *
 * Guarantees:
 *  ✅ Built-in roles (admin/hr/manager/teamlead/employee) always exist.
 *  ✅ Every (role × module × action) pair from the registry has a Permission row.
 *      - Newly created rows get the default value from DEFAULT_ROLE_PERMISSIONS.
 *      - Existing rows are NEVER overridden — admin's UI tweaks survive restarts.
 *  ✅ When a new module/action/sidebar item is added to permissionRegistry.js,
 *      it auto-propagates to all roles on next startup.
 *  ✅ Works after a fresh DB / DB restore / new tenant — no manual seed scripts.
 *
 * Non-goals (intentional):
 *  ✗ Does NOT delete legacy/orphan permission rows automatically (safer to
 *    leave them; admins can clean them via the UI). A separate maintenance
 *    function `cleanupOrphanPermissions()` is provided.
 */
import prisma from './prisma.js';
import {
  MODULE_ACTIONS,
  SIDEBAR_ITEMS,
  BUILTIN_ROLES,
  getDefaultPermission,
} from '../config/permissionRegistry.js';

export async function syncPermissions() {
  const startedAt = Date.now();
  let rolesCreated = 0;
  let permsCreated = 0;

  try {
    // 1. Ensure default organization exists (needed for RoleConfig.organizationId)
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'Default Organization', subscriptionPlan: 'free', isActive: true },
      });
    }

    // 2. Ensure every built-in role exists
    for (const r of BUILTIN_ROLES) {
      const existed = await prisma.roleConfig.findUnique({ where: { name: r.name } });
      if (!existed) {
        await prisma.roleConfig.create({
          data: {
            name: r.name,
            description: r.description,
            isCustom: false,
            isActive: true,
            organizationId: org.id,
          },
        });
        rolesCreated++;
      }
    }

    // 3. For every role (built-in + custom), make sure every registry entry
    //    has a Permission row. Only inserts missing ones; never overrides.
    const allRoles = await prisma.roleConfig.findMany({
      include: { permissions: { select: { module: true, action: true } } },
    });

    for (const role of allRoles) {
      const existingKeys = new Set(
        role.permissions.map((p) => `${p.module}:${p.action}`)
      );
      const toCreate = [];

      // Feature module permissions
      for (const [module, actions] of Object.entries(MODULE_ACTIONS)) {
        for (const action of actions) {
          if (existingKeys.has(`${module}:${action}`)) continue;
          toCreate.push({
            roleId: role.id,
            module,
            action,
            isEnabled: getDefaultPermission(role.name, module, action),
          });
        }
      }

      // Sidebar permissions
      for (const key of Object.keys(SIDEBAR_ITEMS)) {
        if (existingKeys.has(`sidebar:${key}`)) continue;
        toCreate.push({
          roleId: role.id,
          module: 'sidebar',
          action: key,
          isEnabled: getDefaultPermission(role.name, 'sidebar', key),
        });
      }

      if (toCreate.length > 0) {
        await prisma.permission.createMany({ data: toCreate });
        permsCreated += toCreate.length;
      }
    }

    const ms = Date.now() - startedAt;
    console.log(
      `🔐 Permission sync: ${rolesCreated} role(s) + ${permsCreated} permission(s) created in ${ms}ms`
    );
  } catch (error) {
    console.error('❌ syncPermissions failed:', error);
    // Don't throw — server should still boot even if permissions can't sync.
  }
}

/**
 * Optional cleanup — removes Permission rows whose (module, action) is no
 * longer in the registry. NOT called automatically. Expose via admin endpoint
 * if/when needed.
 */
export async function cleanupOrphanPermissions() {
  const validKeys = new Set();
  for (const [m, actions] of Object.entries(MODULE_ACTIONS)) {
    for (const a of actions) validKeys.add(`${m}:${a}`);
  }
  for (const k of Object.keys(SIDEBAR_ITEMS)) validKeys.add(`sidebar:${k}`);

  const all = await prisma.permission.findMany({ select: { id: true, module: true, action: true } });
  const orphanIds = all
    .filter((p) => !validKeys.has(`${p.module}:${p.action}`))
    .map((p) => p.id);

  if (orphanIds.length > 0) {
    await prisma.permission.deleteMany({ where: { id: { in: orphanIds } } });
    console.log(`🧹 Removed ${orphanIds.length} orphan permission row(s)`);
  }
  return orphanIds.length;
}
