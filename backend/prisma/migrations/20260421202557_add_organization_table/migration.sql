-- CreateTable
CREATE TABLE "Organization" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "subscriptionPlan" TEXT DEFAULT 'free',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityMaster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityMaster_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL DEFAULT 1,
    "employeeId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("employeeId", "fileName", "fileSize", "fileUrl", "id", "originalName", "uploadedAt") SELECT "employeeId", "fileName", "fileSize", "fileUrl", "id", "originalName", "uploadedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE INDEX "Document_employeeId_idx" ON "Document"("employeeId");
CREATE INDEX "Document_organizationId_idx" ON "Document"("organizationId");
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "jobTitle" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "role" TEXT NOT NULL DEFAULT 'employee',
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" INTEGER,
    "needsPasswordChange" BOOLEAN NOT NULL DEFAULT false,
    "profilePicture" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "managerId" INTEGER,
    "settings" JSONB,
    CONSTRAINT "Employee_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("address", "createdAt", "createdBy", "department", "email", "id", "jobTitle", "lastLogin", "location", "managerId", "name", "needsPasswordChange", "password", "phone", "profilePicture", "role", "settings", "status", "twoFactorEnabled", "twoFactorSecret", "updatedAt") SELECT "address", "createdAt", "createdBy", "department", "email", "id", "jobTitle", "lastLogin", "location", "managerId", "name", "needsPasswordChange", "password", "phone", "profilePicture", "role", "settings", "status", "twoFactorEnabled", "twoFactorSecret", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE INDEX "Employee_organizationId_idx" ON "Employee"("organizationId");
CREATE INDEX "Employee_email_organizationId_idx" ON "Employee"("email", "organizationId");
CREATE TABLE "new_LeaveRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL DEFAULT 1,
    "employeeId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeaveRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LeaveRequest" ("createdAt", "employeeId", "endDate", "id", "reason", "startDate", "status", "type") SELECT "createdAt", "employeeId", "endDate", "id", "reason", "startDate", "status", "type" FROM "LeaveRequest";
DROP TABLE "LeaveRequest";
ALTER TABLE "new_LeaveRequest" RENAME TO "LeaveRequest";
CREATE INDEX "LeaveRequest_organizationId_idx" ON "LeaveRequest"("organizationId");
CREATE TABLE "new_PerformanceCycle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PerformanceCycle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PerformanceCycle" ("createdAt", "description", "endDate", "id", "name", "startDate", "status", "updatedAt") SELECT "createdAt", "description", "endDate", "id", "name", "startDate", "status", "updatedAt" FROM "PerformanceCycle";
DROP TABLE "PerformanceCycle";
ALTER TABLE "new_PerformanceCycle" RENAME TO "PerformanceCycle";
CREATE INDEX "PerformanceCycle_organizationId_idx" ON "PerformanceCycle"("organizationId");
CREATE TABLE "new_PermissionAudit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL DEFAULT 1,
    "roleId" INTEGER NOT NULL,
    "changedBy" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousValue" BOOLEAN NOT NULL,
    "newValue" BOOLEAN NOT NULL,
    "reason" TEXT,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PermissionAudit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PermissionAudit_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PermissionAudit_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "RoleConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PermissionAudit" ("action", "changedAt", "changedBy", "id", "module", "newValue", "previousValue", "reason", "roleId") SELECT "action", "changedAt", "changedBy", "id", "module", "newValue", "previousValue", "reason", "roleId" FROM "PermissionAudit";
DROP TABLE "PermissionAudit";
ALTER TABLE "new_PermissionAudit" RENAME TO "PermissionAudit";
CREATE INDEX "PermissionAudit_roleId_idx" ON "PermissionAudit"("roleId");
CREATE INDEX "PermissionAudit_changedBy_idx" ON "PermissionAudit"("changedBy");
CREATE INDEX "PermissionAudit_changedAt_idx" ON "PermissionAudit"("changedAt");
CREATE INDEX "PermissionAudit_organizationId_idx" ON "PermissionAudit"("organizationId");
CREATE TABLE "new_RoleConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RoleConfig_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RoleConfig" ("createdAt", "description", "id", "isActive", "isCustom", "name", "updatedAt") SELECT "createdAt", "description", "id", "isActive", "isCustom", "name", "updatedAt" FROM "RoleConfig";
DROP TABLE "RoleConfig";
ALTER TABLE "new_RoleConfig" RENAME TO "RoleConfig";
CREATE UNIQUE INDEX "RoleConfig_name_key" ON "RoleConfig"("name");
CREATE INDEX "RoleConfig_name_idx" ON "RoleConfig"("name");
CREATE INDEX "RoleConfig_organizationId_idx" ON "RoleConfig"("organizationId");
CREATE TABLE "new_SalaryComponent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "isPercentage" BOOLEAN NOT NULL DEFAULT false,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalaryComponent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SalaryComponent" ("amount", "category", "createdAt", "id", "isPercentage", "isTaxable", "name", "status", "type", "updatedAt") SELECT "amount", "category", "createdAt", "id", "isPercentage", "isTaxable", "name", "status", "type", "updatedAt" FROM "SalaryComponent";
DROP TABLE "SalaryComponent";
ALTER TABLE "new_SalaryComponent" RENAME TO "SalaryComponent";
CREATE INDEX "SalaryComponent_organizationId_idx" ON "SalaryComponent"("organizationId");
CREATE TABLE "new_Timesheet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organizationId" INTEGER NOT NULL DEFAULT 1,
    "employeeId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "hours" REAL NOT NULL,
    "description" TEXT,
    "activityId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "approvedBy" INTEGER,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Timesheet_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "ActivityMaster" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Timesheet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Timesheet_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Timesheet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Timesheet" ("approvedAt", "approvedBy", "createdAt", "date", "description", "employeeId", "hours", "id", "status", "updatedAt") SELECT "approvedAt", "approvedBy", "createdAt", "date", "description", "employeeId", "hours", "id", "status", "updatedAt" FROM "Timesheet";
DROP TABLE "Timesheet";
ALTER TABLE "new_Timesheet" RENAME TO "Timesheet";
CREATE INDEX "Timesheet_organizationId_idx" ON "Timesheet"("organizationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Organization_isActive_idx" ON "Organization"("isActive");

-- CreateIndex
CREATE INDEX "ActivityMaster_isActive_idx" ON "ActivityMaster"("isActive");
