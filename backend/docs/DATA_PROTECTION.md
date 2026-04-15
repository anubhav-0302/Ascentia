# Data Protection & Backup Guide

## 🚨 IMPORTANT: Protect Your Data

Your application data is critical. Follow these guidelines to prevent data loss.

## 📦 Backup System

### Automatic Backups
- **Daily backups**: Automatically created at 2:00 AM
- **Pre-migration backups**: Created before any schema changes
- **Manual backups**: Can be created anytime

### Backup Commands

```bash
# Create a manual backup
npm run backup:create [description]

# List all available backups
npm run backup:list

# Restore from backup
npm run backup:restore <backup-name>

# Start scheduled backups
npm run backup:schedule
```

## 🔄 Safe Schema Changes

### NEVER use `npx prisma db push` directly!
Instead, use the safe migration tool:

```bash
# For new schema changes (SAFEST)
npm run db:migrate add-settings-column

# If you MUST use push (RISKY)
npm run db:push --force
```

### Migration Safety Rules

1. **Always backup first** - The safe-migrate script does this automatically
2. **Use migrations for production** - `migrate dev` is safer than `push`
3. **Test on development** - Never apply untested migrations to production
4. **Check for destructive changes** - The tool warns you about potential data loss

## 🛡️ Data Protection Best Practices

### Before Any Schema Change:
1. ✅ Create a manual backup: `npm run backup:create pre-schema-change`
2. ✅ Use safe migration: `npm run db:migrate <name>`
3. ✅ Verify data after migration

### Daily Operations:
1. ✅ Backups run automatically at 2 AM
2. ✅ Keep last 30 backups (auto-cleanup)
3. ✅ Each backup includes employee count and metadata

### Recovery Scenarios:
1. **Schema change failed**: Restore from pre-migration backup
2. **Accidental data deletion**: Restore from most recent backup
3. **Development reset**: Create backup before resetting

## 📁 Backup Structure

```
backend/
├── backups/
│   ├── dev-db-backup-2024-04-16T02-00-00-000Z-daily-auto.db
│   ├── dev-db-backup-2024-04-16T10-30-00-000Z-pre-migration.db
│   └── dev-db-backup-2024-04-16T10-35-00-000Z-manual.db
└── scripts/
    ├── backup-system.js    # Backup management
    └── safe-migrate.js     # Safe migration wrapper
```

## 🚨 Emergency Recovery

If you lose data:

1. **Stop the server** immediately
2. **List backups**: `npm run backup:list`
3. **Choose backup** with highest employee count
4. **Restore**: `npm run backup:restore <backup-name>`
5. **Verify data** before starting server

## 🔍 Backup Verification

Each backup includes:
- Timestamp
- Description
- File size
- Employee count
- Database integrity check

## 📊 Monitoring

Check backup health:
```bash
# See all backups with details
npm run backup:list

# Check current employee count
node check-db.js
```

## ⚠️ Common Mistakes to Avoid

1. **❌ Using `npx prisma db push` without backup**
2. **❌ Modifying schema directly without migration**
3. **❌ Deleting backup files manually**
4. **❌ Running migrations on production without testing**
5. **❌ Ignoring backup warnings**

## ✅ Safe Development Workflow

1. **Start server**: `npm run dev`
2. **Need schema change?** → `npm run backup:create pre-dev`
3. **Apply change**: `npm run db:migrate <description>`
4. **Test thoroughly**
5. **If issues**: `npm run backup:restore <backup>`

## 🆘 Support

If you encounter issues:
1. Check backup directory exists
2. Verify backup files are not corrupted
3. Ensure server is stopped during restore
4. Check disk space (backups need space)

Remember: **It's better to have too many backups than to lose data!**
