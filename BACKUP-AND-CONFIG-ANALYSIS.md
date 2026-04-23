# Backup & Configuration Analysis

## Current Backup Approach

### ✅ What's Currently Configured:

1. **Automatic Daily Backups**
   - Scheduled at 2:00 AM daily via cron job
   - Location: `backend/backups/` directory
   - Format: Compressed `.db.gz` files (gzip compression)
   - Naming: `dev-db-backup-{timestamp}-{description}.db.gz`
   - Metadata: `.meta.json` file for each backup

2. **Backup Retention**
   - Keeps last 30 backups
   - Automatically deletes older backups
   - Saves disk space with compression

3. **Backup Operations**
   - Manual backup: `npm run backup:create`
   - List backups: `npm run backup:list`
   - Restore backup: `npm run backup:restore`

### ⚠️ Current Limitations:

1. **SuperAdmin NOT Automatically Created**
   - SuperAdmin must be manually created via `node create-super-admin.js`
   - NOT part of database initialization
   - NOT restored automatically when DB is reset

2. **Organizations NOT Backed Up Separately**
   - Backups include entire database (all organizations)
   - No selective backup per organization
   - Full database restore only

3. **No .env File**
   - No environment variables configured
   - Credentials hardcoded in scripts:
     - Admin: `admin@ascentia.com` / `admin123`
     - Employee: `employee@ascentia.com` / `123456`
     - SuperAdmin: `superadmin@ascentia.com` / `superadmin123` (manual)

## Recommendations for Production

### 1. **Auto-Create SuperAdmin on DB Reset**
Add to `index.js` initialization:
```javascript
// Seed default SuperAdmin if not exists
const superAdminEmail = 'superadmin@ascentia.com';
const existingSuperAdmin = await prisma.employee.findFirst({
  where: { email: superAdminEmail }
});

if (!existingSuperAdmin) {
  const hashedPassword = await bcrypt.hash('superadmin123', 10);
  await prisma.employee.create({
    data: {
      name: 'Super Admin',
      email: superAdminEmail,
      password: hashedPassword,
      role: 'superAdmin',
      jobTitle: 'Super Administrator',
      department: 'IT',
      location: 'Remote',
      status: 'active'
      // No organizationId - SuperAdmin is not tied to any org
    }
  });
  console.log("✅ Created default SuperAdmin");
}
```

### 2. **Create .env File for Credentials**
Create `backend/.env`:
```
# Database
DATABASE_URL=file:./dev.db

# Default Credentials
ADMIN_EMAIL=admin@ascentia.com
ADMIN_PASSWORD=admin123
EMPLOYEE_EMAIL=employee@ascentia.com
EMPLOYEE_PASSWORD=123456
SUPERADMIN_EMAIL=superadmin@ascentia.com
SUPERADMIN_PASSWORD=superadmin123

# Server
PORT=5000
NODE_ENV=development

# Backup
BACKUP_DIR=./backups
MAX_BACKUPS=30
BACKUP_TIME=02:00
```

Then update `index.js` to use .env:
```javascript
import dotenv from 'dotenv';
dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL || 'admin@ascentia.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
// ... etc
```

### 3. **Per-Organization Backup Strategy**
For production multi-tenant:
```javascript
// Backup specific organization data
async function backupOrganization(orgId) {
  const orgData = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      employees: true,
      leaveRequests: true,
      timesheets: true,
      // ... all relations
    }
  });
  
  // Save to separate backup file
  const backupFile = `org-${orgId}-backup-${timestamp}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(orgData, null, 2));
}
```

### 4. **Backup Metadata Enhancement**
Current metadata should include:
```json
{
  "timestamp": "2026-04-22T05:27:00Z",
  "description": "daily-backup",
  "originalSize": 1024000,
  "compressedSize": 256000,
  "compressionRatio": 0.75,
  "organizationCount": 3,
  "employeeCount": 12,
  "superAdminExists": true,
  "version": "1.0.0"
}
```

## Current Database Initialization Flow

### On Server Startup:
1. ✅ Create default organization if not exists
2. ✅ Create admin user if not exists
3. ✅ Create employee user if not exists
4. ❌ **Does NOT create SuperAdmin** (manual step required)
5. ✅ Initialize leave data
6. ✅ Seed default roles

### On Database Reset:
1. ✅ All data deleted
2. ✅ Schema recreated
3. ✅ Default org/admin/employee recreated on next startup
4. ❌ **SuperAdmin lost** (must be manually recreated)

## Action Items for Production

- [ ] Add SuperAdmin auto-creation to `index.js`
- [ ] Create `.env` file with all credentials
- [ ] Add `dotenv` package to `package.json`
- [ ] Update initialization to use `.env` variables
- [ ] Add organization count to backup metadata
- [ ] Document backup/restore procedures
- [ ] Test full backup/restore cycle with multi-org data
- [ ] Add backup verification script

## Current Status

✅ **Backup System**: Fully functional for entire database
✅ **Automatic Scheduling**: Daily at 2:00 AM
✅ **Compression**: Enabled (saves ~75% space)
✅ **Retention**: 30 backups kept
❌ **SuperAdmin Auto-Creation**: Not implemented
❌ **Environment Variables**: Not configured
❌ **Per-Org Backups**: Not implemented

## Conclusion

The backup system is **production-ready for single-organization use**. For multi-tenant production deployment, recommend:
1. Auto-create SuperAdmin on initialization
2. Implement .env configuration
3. Add per-organization backup capability
4. Enhance backup metadata with org/user counts
