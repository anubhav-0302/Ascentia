# 🚀 SETUP INSTRUCTIONS - RBAC SYSTEM

## ⚠️ IMPORTANT: REQUIRED SETUP STEPS

Before you can use the CONFIGURE section, you need to complete these setup steps:

---

## **STEP 1: Run Prisma Migration** ✅

This creates the new database tables for the dynamic RBAC system.

```bash
cd backend
npx prisma migrate dev --name add_dynamic_rbac
```

**What this does:**
- Creates `RoleConfig` table
- Creates `Permission` table
- Creates `PermissionAudit` table

**Expected output:**
```
✔ Enter a name for the new migration: add_dynamic_rbac
✔ Your database has been successfully migrated to the latest schema.
```

---

## **STEP 2: Seed Default Roles** ✅

This populates the database with default roles (admin, hr, manager, employee) and their permissions.

```bash
cd backend
node scripts/seedRoleConfig.js
```

**Expected output:**
```
🌱 Seeding role configuration...
✅ Created role: admin
✅ Created 38 permissions for admin
✅ Created role: hr
✅ Created 32 permissions for hr
✅ Created role: manager
✅ Created 32 permissions for manager
✅ Created role: employee
✅ Created 32 permissions for employee
✅ Role configuration seeded successfully!
```

---

## **STEP 3: Start Backend** ✅

```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Ascentia API running on http://localhost:5000
🔧 Complete API mode with database persistence - all routes available
```

---

## **STEP 4: Start Frontend** ✅

In a new terminal:

```bash
cd frontend
npm start
```

**Expected output:**
```
  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

---

## **STEP 5: Login and Test** ✅

1. Navigate to `http://localhost:3000`
2. Login with admin credentials:
   ```
   Email: admin@ascentia.com
   Password: admin123
   ```
3. Go to Settings (profile icon → Settings)
4. Click "CONFIGURE" in the left sidebar
5. You should see the role management UI

---

## **TROUBLESHOOTING**

### **Error: "Failed to fetch roles"**

**Cause:** Database migration not run or seed script not executed

**Solution:**
```bash
# Run migration
cd backend
npx prisma migrate dev --name add_dynamic_rbac

# Seed roles
node scripts/seedRoleConfig.js

# Restart backend
npm run dev
```

---

### **Error: "Cannot find module 'axios'"**

**Cause:** Frontend dependencies not installed

**Solution:**
```bash
cd frontend
npm install
npm start
```

---

### **Error: "CONFIGURE button not visible"**

**Cause:** Not logged in as admin

**Solution:**
- Make sure you're logged in as: `admin@ascentia.com` / `admin123`
- Non-admin users won't see the CONFIGURE button

---

### **Error: "Backend not responding"**

**Cause:** Backend not running

**Solution:**
```bash
cd backend
npm run dev
```

Make sure backend is running on `http://localhost:5000`

---

### **Error: "Vite cache issue"**

**Cause:** Vite dev server has stale cache

**Solution:**
```bash
cd frontend
# Stop the dev server (Ctrl + C)
# Then:
rm -r node_modules/.vite
npm start
```

---

## **COMPLETE SETUP CHECKLIST**

- [ ] Run `npx prisma migrate dev --name add_dynamic_rbac`
- [ ] Run `node scripts/seedRoleConfig.js`
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Logged in as `admin@ascentia.com`
- [ ] CONFIGURE button visible in Settings
- [ ] Can view roles and permissions

---

## **VERIFY SETUP**

### **Check Backend**
```bash
# In backend terminal, you should see:
🚀 Ascentia API running on http://localhost:5000
🔧 Complete API mode with database persistence
```

### **Check Database**
```bash
cd backend
npx prisma studio
```

This opens a UI where you can see:
- RoleConfig table (should have 4 roles)
- Permission table (should have 134 permissions)
- PermissionAudit table (should be empty initially)

### **Check Frontend**
1. Login as admin
2. Go to Settings
3. CONFIGURE button should be visible
4. Click it and see the role management UI

---

## **QUICK START COMMANDS**

**Terminal 1 - Backend:**
```bash
cd backend
npx prisma migrate dev --name add_dynamic_rbac
node scripts/seedRoleConfig.js
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

**Then:**
1. Open `http://localhost:3000`
2. Login with `admin@ascentia.com` / `admin123`
3. Go to Settings → CONFIGURE
4. Manage roles and permissions!

---

## **WHAT SHOULD WORK**

After setup, you should be able to:

✅ View all roles (Admin, HR, Manager, Employee)
✅ View role permissions in a matrix
✅ Toggle permissions ON/OFF
✅ Save changes with a reason
✅ Create custom roles
✅ Delete custom roles
✅ View audit log of all changes
✅ See who made changes and when

---

## **DATABASE TABLES CREATED**

### **RoleConfig**
- Stores role definitions
- Fields: id, name, description, isCustom, isActive, createdAt, updatedAt

### **Permission**
- Stores module + action permissions
- Fields: id, roleId, module, action, isEnabled, createdAt, updatedAt

### **PermissionAudit**
- Stores permission change history
- Fields: id, roleId, changedBy, module, action, previousValue, newValue, reason, changedAt

---

## **API ENDPOINTS**

After setup, these endpoints are available:

```
GET    /api/admin/roles                    → Get all roles
GET    /api/admin/roles/:id                → Get role permissions
PUT    /api/admin/roles/:id/permissions    → Update permissions
POST   /api/admin/roles                    → Create custom role
DELETE /api/admin/roles/:id                → Delete custom role
GET    /api/admin/permissions/audit        → Get audit log
GET    /api/admin/permissions/check        → Check user permission
```

All require admin authentication.

---

## **SUPPORT**

If you encounter issues:

1. Check that both backend and frontend are running
2. Verify migration was run: `npx prisma migrate status`
3. Verify seed was run: `npx prisma studio` (check RoleConfig table)
4. Check browser console for errors (F12)
5. Check backend logs for error messages

---

**Status: ✅ READY FOR SETUP**

Follow these steps and the CONFIGURE section will work perfectly!

---

**Date**: April 16, 2026
**Version**: 1.0.0
