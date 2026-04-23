# 🛡️ Data Loss Prevention & Disaster Recovery Guide

## Overview

This guide covers the comprehensive data loss prevention and disaster recovery protocols implemented in Ascentia HRMS.

---

## 1. AUTOMATED DATA PROTECTION

### Daily Protection Cycle

The system runs automated data protection every day at 2:00 AM:

```bash
npm run protect:run
```

**What it does:**
1. ✅ Performs data integrity checks
2. ✅ Creates verified backups
3. ✅ Validates and repairs corrupted data
4. ✅ Creates monthly archives
5. ✅ Logs all operations

### Data Integrity Checks

Automatically validates:
- ✅ Employee data consistency (email, name, etc.)
- ✅ Organization data integrity
- ✅ Leave request date ranges
- ✅ Timesheet hours validity (0-24)
- ✅ Foreign key relationships
- ✅ Database constraints

**Run manually:**
```bash
npm run protect:integrity
```

### Data Validation & Repair

Automatically fixes:
- ✅ Invalid employee emails
- ✅ Invalid leave date ranges
- ✅ Invalid timesheet hours
- ✅ Broken organization references
- ✅ Missing required fields

**Run manually:**
```bash
npm run protect:validate
```

---

## 2. BACKUP SYSTEM

### Automatic Daily Backups

**Schedule:** 2:00 AM daily
**Location:** `backend/backups/`
**Format:** Compressed `.db.gz` files
**Retention:** Last 30 backups
**Compression:** ~75% space savings

### Create Manual Backup

```bash
npm run backup:create
```

Creates:
- Compressed database backup
- Metadata file with checksums
- Integrity verification
- Transaction log entry

### List All Backups

```bash
npm run backup:list
```

Shows:
- Backup filename
- Creation timestamp
- Description
- Size
- Employee count

### Backup Metadata

Each backup includes:
```json
{
  "timestamp": "2026-04-23T03:59:00Z",
  "description": "daily-backup",
  "originalSize": 1024000,
  "compressedSize": 256000,
  "compressionRatio": 0.75,
  "verified": true,
  "checksums": {
    "size": 256000,
    "mtime": "2026-04-23T03:59:00Z"
  }
}
```

---

## 3. DISASTER RECOVERY

### List Available Backups

```bash
npm run recover:list
```

Shows all available backups with:
- Filename
- Size
- Creation date
- Verification status
- Description

### Verify Backup Integrity

Before restoring, always verify:

```bash
npm run recover:verify <backup-file>
```

Checks:
- ✅ File exists and is readable
- ✅ Compression integrity
- ✅ Metadata validity
- ✅ Decompression test

### Restore from Backup

**Full restoration:**
```bash
npm run recover:restore <backup-file>
```

**Process:**
1. Verifies backup integrity
2. Creates backup of current database
3. Decompresses backup
4. Replaces current database
5. Verifies restored database
6. Logs restoration event

### Find Backup by Date

Find the closest backup to a specific date:

```bash
npm run recover:find "2026-04-22T10:00:00Z"
```

Returns:
- Closest backup file
- Time difference
- Metadata

### Test Recovery Procedure

Test recovery without making changes:

```bash
npm run recover:test <backup-file>
```

**Performs:**
- Backup verification
- Dry-run restoration
- Database connection test
- No actual data changes

---

## 4. TRANSACTION LOGGING

All operations are logged:

**Location:** `backend/logs/`

**Log files:**
- `backups.log` - Backup operations
- `restorations.log` - Restoration events
- `transactions-YYYY-MM-DD.log` - Daily transactions
- `archives.log` - Archive operations

**Log format:**
```
[2026-04-23T03:59:00Z] Backup created: verified-backup-2026-04-23T03-59-00-scheduled (256 KB)
[2026-04-23T04:00:00Z] Data integrity check: PASS (0 issues)
[2026-04-23T04:01:00Z] Monthly archive created: archive-2026-04 (5 backups)
```

---

## 5. DATA INTEGRITY DIRECTORIES

### Structure

```
backend/
├── backups/                    # Daily backups
│   ├── verified-backup-*.db.gz
│   └── verified-backup-*.meta.json
├── data-integrity/             # Integrity reports
│   ├── integrity-check-*.json
│   └── repair-report-*.json
├── archives/                   # Monthly archives
│   ├── archive-*.meta.json
│   └── archives.log
└── logs/                        # Operation logs
    ├── backups.log
    ├── restorations.log
    ├── archives.log
    └── transactions-*.log
```

---

## 6. RECOVERY SCENARIOS

### Scenario 1: Data Corruption

**Symptoms:**
- Invalid data in database
- Constraint violations
- Missing required fields

**Recovery:**
```bash
# 1. Run data validation
npm run protect:validate

# 2. Check integrity report
cat backend/data-integrity/repair-report-*.json

# 3. If repair fails, restore from backup
npm run recover:restore <backup-file>
```

### Scenario 2: Accidental Deletion

**Recovery:**
```bash
# 1. List available backups
npm run recover:list

# 2. Find backup from before deletion
npm run recover:find "2026-04-22T10:00:00Z"

# 3. Test recovery first
npm run recover:test <backup-file>

# 4. Restore from backup
npm run recover:restore <backup-file>
```

### Scenario 3: Database Corruption

**Recovery:**
```bash
# 1. Verify backup integrity
npm run recover:verify <backup-file>

# 2. Test recovery procedure
npm run recover:test <backup-file>

# 3. Restore from backup
npm run recover:restore <backup-file>

# 4. Verify restored data
npm run protect:integrity
```

### Scenario 4: Complete Data Loss

**Recovery:**
```bash
# 1. List all available backups
npm run recover:list

# 2. Choose most recent backup
npm run recover:restore <latest-backup>

# 3. Verify restoration
npm run protect:integrity

# 4. Check transaction logs
cat backend/logs/transactions-*.log
```

---

## 7. BACKUP RETENTION POLICY

### Daily Backups
- **Kept:** Last 30 days
- **Frequency:** 1 per day
- **Size:** ~256 KB each (compressed)
- **Total Space:** ~7.7 MB

### Monthly Archives
- **Kept:** All monthly archives
- **Frequency:** 1 per month
- **Contains:** All backups from that month
- **Metadata:** Included

### Recommended Retention
- **Daily backups:** 30 days
- **Monthly archives:** 12 months
- **Yearly archives:** 5 years (optional)

---

## 8. MONITORING & ALERTS

### Check Backup Status

```bash
npm run backup:list
```

**Monitor:**
- ✅ Latest backup timestamp
- ✅ Backup file size
- ✅ Backup count
- ✅ Compression ratio

### Check Data Integrity

```bash
npm run protect:integrity
```

**Monitor:**
- ✅ Integrity status (PASS/FAIL)
- ✅ Issues found
- ✅ Data consistency
- ✅ Foreign key integrity

### Review Logs

```bash
# View backup logs
tail -f backend/logs/backups.log

# View restoration logs
tail -f backend/logs/restorations.log

# View transaction logs
tail -f backend/logs/transactions-*.log
```

---

## 9. BEST PRACTICES

### Daily Operations
- ✅ Monitor backup logs daily
- ✅ Verify latest backup integrity
- ✅ Check data integrity reports
- ✅ Review transaction logs

### Weekly Operations
- ✅ Test recovery procedure
- ✅ Verify backup accessibility
- ✅ Check disk space usage
- ✅ Review any data issues

### Monthly Operations
- ✅ Create monthly archive
- ✅ Verify archive integrity
- ✅ Test full restoration
- ✅ Review retention policy

### Quarterly Operations
- ✅ Disaster recovery drill
- ✅ Full backup verification
- ✅ Data integrity audit
- ✅ Update recovery procedures

---

## 10. EMERGENCY PROCEDURES

### If Database is Corrupted

```bash
# Step 1: Stop the application
# (Stop the running server)

# Step 2: Verify backup
npm run recover:verify <backup-file>

# Step 3: Test recovery
npm run recover:test <backup-file>

# Step 4: Restore database
npm run recover:restore <backup-file>

# Step 5: Verify restoration
npm run protect:integrity

# Step 6: Restart application
npm run dev
```

### If Data is Lost

```bash
# Step 1: Identify when data was lost
# (Check transaction logs)

# Step 2: Find backup from before loss
npm run recover:find "2026-04-22T10:00:00Z"

# Step 3: Verify backup integrity
npm run recover:verify <backup-file>

# Step 4: Test recovery
npm run recover:test <backup-file>

# Step 5: Restore from backup
npm run recover:restore <backup-file>

# Step 6: Verify all data is restored
npm run protect:integrity
```

### If Backup is Corrupted

```bash
# Step 1: Verify backup integrity
npm run recover:verify <backup-file>

# Step 2: If corrupted, use previous backup
npm run recover:list

# Step 3: Find older backup
npm run recover:find "2026-04-21T10:00:00Z"

# Step 4: Restore from older backup
npm run recover:restore <older-backup>
```

---

## 11. AUTOMATION SETUP

### Cron Job for Daily Protection

Add to crontab:

```bash
# Run data protection daily at 2:00 AM
0 2 * * * cd /path/to/ascentia/backend && npm run protect:run >> logs/protection.log 2>&1

# Run backup verification daily at 3:00 AM
0 3 * * * cd /path/to/ascentia/backend && npm run recover:verify $(ls -t backups/*.db.gz | head -1) >> logs/verification.log 2>&1

# Create monthly archive on 1st of month at 4:00 AM
0 4 1 * * cd /path/to/ascentia/backend && npm run protect:run >> logs/archive.log 2>&1
```

### Windows Task Scheduler

Create scheduled tasks:

```batch
# Task 1: Daily data protection at 2:00 AM
schtasks /create /tn "Ascentia-DataProtection" /tr "npm run protect:run" /sc daily /st 02:00

# Task 2: Daily backup verification at 3:00 AM
schtasks /create /tn "Ascentia-BackupVerification" /tr "npm run recover:verify" /sc daily /st 03:00
```

---

## 12. SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue:** Backup verification fails
```bash
# Solution: Check backup file integrity
npm run recover:verify <backup-file>

# If corrupted, use previous backup
npm run recover:list
```

**Issue:** Restoration fails
```bash
# Solution: Test recovery first
npm run recover:test <backup-file>

# Check logs for errors
cat backend/logs/restorations.log
```

**Issue:** Data integrity check fails
```bash
# Solution: Run data validation
npm run protect:validate

# Check repair report
cat backend/data-integrity/repair-report-*.json
```

### Getting Help

1. Check logs: `backend/logs/`
2. Review integrity reports: `backend/data-integrity/`
3. Verify backups: `npm run recover:list`
4. Test recovery: `npm run recover:test <backup-file>`

---

## Summary

✅ **Automated daily backups** - 30 backups retained
✅ **Data integrity checks** - Real-time validation
✅ **Disaster recovery** - Point-in-time recovery
✅ **Transaction logging** - Complete audit trail
✅ **Monthly archives** - Long-term retention
✅ **Automated repairs** - Self-healing database
✅ **Verification tests** - Pre-restoration validation
✅ **Emergency procedures** - Step-by-step recovery

**Your data is protected 24/7!** 🛡️
