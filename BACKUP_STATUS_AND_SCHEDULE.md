# 📦 BACKUP STATUS & SCHEDULE

## Current Backup Status

### **Backup Directory**
- **Location:** `backend/backups/`
- **Status:** ✅ EXISTS (Empty - No backups created yet)
- **Capacity:** Unlimited (keeps last 30 backups)
- **Space Savings:** 70-80% compression

### **Existing Backups**
- **Count:** 0 (None created yet)
- **Reason:** Backups are created on-demand or on schedule
- **First Backup:** Will be created when:
  - You manually create one via API
  - You delete an employee
  - You restore from a backup
  - Scheduled backup runs (if enabled)

---

## How Backups Are Created

### **Automatic Backups (No Action Needed)**

Backups are automatically created before:

1. **Employee Deletion**
   - Pre-delete backup created
   - Stored with employee email in name
   - Example: `dev-db-backup-2026-04-16T23-07-00-000Z-pre-delete-john@example.com.db.gz`

2. **Database Restoration**
   - Pre-restore backup created
   - Ensures you can undo a restoration
   - Example: `dev-db-backup-2026-04-16T23-06-00-000Z-pre-restore.db.gz`

3. **Scheduled Backups** (Optional)
   - Daily at 2:00 AM (if enabled)
   - Example: `dev-db-backup-2026-04-16T02-00-00-000Z-daily-auto.db.gz`

### **Manual Backups (On-Demand)**

Create anytime via API:
```bash
POST /api/data-protection/backups
{
  "description": "Before major changes"
}
```

---

## Backup Schedule

### **Current Schedule Status**

| Schedule | Status | Time | Frequency |
|----------|--------|------|-----------|
| Daily Auto Backup | ⏸️ DISABLED | 2:00 AM | Daily |
| Manual Backup | ✅ ENABLED | On-demand | Anytime |
| Pre-delete Backup | ✅ ENABLED | On deletion | Per deletion |
| Pre-restore Backup | ✅ ENABLED | On restoration | Per restoration |

### **Enable Scheduled Daily Backups**

If you want automatic daily backups at 2:00 AM:

**Option 1: Via API** (Coming soon)
```bash
POST /api/data-protection/schedule
```

**Option 2: Via CLI**
```bash
node backend/scripts/backup-system.js schedule
```

**Option 3: In Code**
Uncomment in `backend/index.js`:
```javascript
// Uncomment these lines to enable scheduled backups
console.log('🔄 Starting automatic backup system...');
setupScheduledBackups();
console.log('✅ Automatic backups scheduled (daily at 2:00 AM)');
```

---

## Backup Timing & Performance

### **Backup Duration**

| Database Size | Backup Time | Compressed Size |
|---------------|-------------|-----------------|
| 100 KB | < 1 second | 20-30 KB |
| 500 KB | 1-2 seconds | 100-150 KB |
| 1 MB | 2-3 seconds | 200-300 KB |
| 5 MB | 5-10 seconds | 1-1.5 MB |
| 10 MB | 10-15 seconds | 2-3 MB |

**Current Database:** ~150 KB
**Estimated Backup Time:** < 1 second
**Estimated Compressed Size:** 30-50 KB

### **Compression Ratio**

- **Typical:** 70-80% space savings
- **Example:** 150 KB → 30-50 KB
- **Benefit:** Saves storage space
- **Trade-off:** Takes ~1 second to compress

---

## Creating Your First Backup

### **Method 1: Via API (Recommended)**

```bash
curl -X POST http://localhost:5000/api/data-protection/backups \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"description": "Initial backup"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Backup created successfully",
  "data": {
    "filename": "dev-db-backup-2026-04-16T23-15-30-000Z-initial-backup.db.gz",
    "size": 45678,
    "createdAt": "2026-04-16T23:15:30.000Z",
    "metadata": {
      "timestamp": "2026-04-16T23:15:30.000Z",
      "description": "Initial backup",
      "originalSize": 156789,
      "compressedSize": 45678,
      "compressionRatio": "0.71"
    }
  }
}
```

### **Method 2: Via CLI**

```bash
cd backend
node scripts/backup-system.js create "Initial backup"
```

**Output:**
```
✅ Backup created: dev-db-backup-2026-04-16T23-15-30-000Z-initial-backup.db.gz
📊 Employees in backup: 2
💾 Compression: 156.79 KB → 45.68 KB (71% saved)
```

---

## Viewing Your Backups

### **Method 1: Via API**

```bash
curl -X GET http://localhost:5000/api/data-protection/backups \
  -H "Authorization: Bearer <admin-token>"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "dev-db-backup-2026-04-16T23-15-30-000Z-initial-backup.db.gz",
      "size": 45678,
      "createdAt": "2026-04-16T23:15:30.000Z",
      "metadata": {
        "timestamp": "2026-04-16T23:15:30.000Z",
        "description": "Initial backup",
        "originalSize": 156789,
        "compressedSize": 45678,
        "compressionRatio": "0.71",
        "createdBy": "admin@ascentia.com"
      }
    }
  ]
}
```

### **Method 2: Via CLI**

```bash
cd backend
node scripts/backup-system.js list
```

**Output:**
```
📦 Available Backups:
1. dev-db-backup-2026-04-16T23-15-30-000Z-initial-backup.db.gz
   📅 4/16/2026, 11:15:30 PM
   📝 Initial backup
   👥 2 employees
   💾 0.04 MB
```

### **Method 3: Via File System**

```bash
ls -lh backend/backups/
```

---

## Backup File Details

### **File Naming Convention**

```
dev-db-backup-{TIMESTAMP}-{DESCRIPTION}.db.gz
```

**Example:**
```
dev-db-backup-2026-04-16T23-15-30-000Z-initial-backup.db.gz
```

**Components:**
- `dev-db-backup-` - Prefix
- `2026-04-16T23-15-30-000Z` - ISO timestamp
- `initial-backup` - Description
- `.db.gz` - Compressed database file

### **Metadata File**

Each backup has a metadata file:
```
dev-db-backup-2026-04-16T23-15-30-000Z-initial-backup.meta.json
```

**Contents:**
```json
{
  "timestamp": "2026-04-16T23:15:30.000Z",
  "description": "Initial backup",
  "originalSize": 156789,
  "compressedSize": 45678,
  "compressionRatio": "0.71",
  "createdBy": "admin@ascentia.com"
}
```

---

## Backup Retention Policy

### **Current Policy**

- **Keep:** Last 30 backups
- **Delete:** Older backups automatically
- **Reason:** Save storage space
- **Automatic:** No manual cleanup needed

### **Example Scenario**

1. Create backup #1 - Kept
2. Create backup #2 - Kept
3. ... (create backups #3-#30) - All kept
4. Create backup #31 - Kept, backup #1 deleted
5. Create backup #32 - Kept, backup #2 deleted

---

## Backup Storage Estimate

### **Current Database**

- **Size:** ~150 KB
- **Compressed:** ~30-50 KB per backup
- **30 Backups:** ~1-1.5 MB total

### **With 100 Employees**

- **Size:** ~500 KB
- **Compressed:** ~100-150 KB per backup
- **30 Backups:** ~3-4.5 MB total

### **With 1000 Employees**

- **Size:** ~5 MB
- **Compressed:** ~1-1.5 MB per backup
- **30 Backups:** ~30-45 MB total

---

## Recommended Backup Strategy

### **Daily Operations**

1. **Create backup before major changes:**
   ```bash
   POST /api/data-protection/backups
   {"description": "Before adding new employees"}
   ```

2. **Automatic pre-delete backup:**
   - Created automatically when deleting employee
   - No action needed

3. **Automatic pre-restore backup:**
   - Created automatically when restoring
   - No action needed

### **Weekly Maintenance**

1. **Review backup list:**
   ```bash
   GET /api/data-protection/backups
   ```

2. **Check database stats:**
   ```bash
   GET /api/data-protection/stats
   ```

3. **Review deletion logs:**
   ```bash
   GET /api/data-protection/deletion-logs
   ```

### **Monthly Tasks**

1. **Verify backup integrity:**
   - List all backups
   - Check file sizes
   - Verify metadata

2. **Test restoration:**
   - Restore from oldest backup
   - Verify data integrity
   - Restore back to current

3. **Archive important backups:**
   - Copy critical backups to external storage
   - Document backup details

---

## Enabling Scheduled Daily Backups

### **Step 1: Edit index.js**

Find this section in `backend/index.js`:
```javascript
// Start automatic backup system (temporarily disabled)
// console.log('🔄 Starting automatic backup system...');
// setupScheduledBackups();
// console.log('✅ Automatic backups scheduled (daily at 2:00 AM)');
```

### **Step 2: Uncomment the Lines**

```javascript
// Start automatic backup system (temporarily disabled)
console.log('🔄 Starting automatic backup system...');
setupScheduledBackups();
console.log('✅ Automatic backups scheduled (daily at 2:00 AM)');
```

### **Step 3: Restart Backend**

```bash
cd backend
npm run dev
```

### **Step 4: Verify**

You should see in logs:
```
🔄 Starting automatic backup system...
✅ Automatic backups scheduled (daily at 2:00 AM)
```

---

## Backup Commands Reference

### **Create Backup**
```bash
# Via API
curl -X POST http://localhost:5000/api/data-protection/backups \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"description": "My backup"}'

# Via CLI
node backend/scripts/backup-system.js create "My backup"
```

### **List Backups**
```bash
# Via API
curl -X GET http://localhost:5000/api/data-protection/backups \
  -H "Authorization: Bearer <token>"

# Via CLI
node backend/scripts/backup-system.js list

# Via File System
ls -lh backend/backups/
```

### **Restore Backup**
```bash
# Via API
curl -X POST http://localhost:5000/api/data-protection/restore \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "dev-db-backup-2026-04-16T23-15-30-000Z-initial-backup.db.gz",
    "password": "admin123"
  }'

# Via CLI
node backend/scripts/backup-system.js restore "dev-db-backup-2026-04-16T23-15-30-000Z-initial-backup.db.gz"
```

---

## Summary

| Question | Answer |
|----------|--------|
| Are there backups now? | ❌ No - None created yet |
| When will first backup be created? | ✅ On first deletion/restoration or manual creation |
| Backup schedule? | ✅ Daily at 2:00 AM (if enabled) |
| Backup time? | ✅ < 1 second for current DB |
| Backup size? | ✅ ~30-50 KB (compressed) |
| How many backups kept? | ✅ Last 30 backups |
| Can I create manual backups? | ✅ Yes, anytime via API |
| Are pre-delete backups automatic? | ✅ Yes, automatic |
| Are pre-restore backups automatic? | ✅ Yes, automatic |

---

**Status: ✅ BACKUP SYSTEM READY**

- No backups exist yet
- Will be created automatically on deletions/restorations
- Can create manual backups anytime
- Daily schedule available (optional)
- Estimated backup time: < 1 second
- Estimated backup size: 30-50 KB

---

**Date**: April 16, 2026
**Version**: 1.0.0
