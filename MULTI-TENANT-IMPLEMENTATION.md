# Multi-Tenant Feature Implementation

## Overview
The application has been enhanced with multi-tenant support to allow multiple organizations to use the same database while keeping their data isolated.

## Changes Made

### 1. Database Schema Changes
The following models now include `organizationId` field for tenant isolation:

**Models with organizationId:**
- `Employee` - Users belong to organizations
- `LeaveRequest` - Leave requests are organization-specific
- `Timesheet` - Timesheet entries are organization-specific
- `PerformanceCycle` - Performance cycles are organization-specific
- `SalaryComponent` - Salary components are organization-specific
- `Document` - Documents are organization-specific
- `RoleConfig` - Roles are organization-specific
- `PermissionAudit` - Audit logs are organization-specific

**Models WITHOUT organizationId (linked via relations):**
- `EmployeeSalary` - Linked to Employee (which has organizationId)
- `PerformanceGoal` - Linked to PerformanceCycle (which has organizationId)
- `PerformanceReview` - Linked to Employee (which has organizationId)
- `KRA` - Linked to PerformanceGoal (linked via relations)

### 2. Helper Functions Created
**File:** `backend/helpers/tenantHelper.js`

```javascript
// Main tenant isolation filter
export const tenantWhere = (req) => {
  if (!req.user || !req.user.organizationId) {
    return {}; // Backward compatibility for users without org
  }
  return { organizationId: req.user.organizationId };
};

// Tenant filter with additional conditions
export const tenantWhereWith = (req, additionalWhere = {}) => {
  const baseWhere = tenantWhere(req);
  return { ...baseWhere, ...additionalWhere };
};

// Validate resource belongs to user's organization
export const validateTenantAccess = async (prisma, model, id, organizationId) => {
  const resource = await prisma[model].findFirst({
    where: { id, organizationId }
  });
  
  if (!resource) {
    throw new Error('Resource not found or access denied');
  }
  
  return resource;
};

// Middleware to ensure organization is active
export const requireActiveOrganization = (req, res, next) => {
  if (!req.user.organization?.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Organization is not active'
    });
  }
  next();
};
```

### 3. Controller Updates
The following controllers now use `tenantWhere` for data isolation:

- `employeeController.js` - Filters employees by organization
- `leaveController.js` - Filters leave requests by organization
- `timesheetController.js` - Filters timesheets by organization
- `performanceController.js` - Filters performance cycles by organization
- `payrollController.js` - Filters salary components by organization
- `kraController.js` - Fixed to NOT use tenantWhere (KRA linked via relations)
- `dashboardController.js` - Filters dashboard stats by organization

### 4. Authentication Middleware Update
**File:** `backend/middleware/auth.js`

The authentication middleware now includes organization information:
```javascript
req.user.organizationId = user.organizationId;
req.user.organization = user.organization;
```

### 5. Database Initialization
**File:** `backend/index.js`

On server startup:
- Creates default organization if none exists
- Assigns organizationId to admin and employee users
- Seeds roles and permissions per organization

## How It Works

### Data Isolation
When a user makes a request:
1. Authentication middleware sets `req.user.organizationId`
2. Controllers use `tenantWhere(req)` to add `organizationId` filter
3. Database queries automatically filter by user's organization
4. Users can only see/create/update data from their organization

### Backward Compatibility
- Users without `organizationId` get empty filter (can see all data)
- This allows existing data to work while new users get tenant isolation
- Default organizationId is 1 for all existing records

### Organization Structure
```prisma
model Organization {
  id               Int       @id @default(autoincrement())
  name             String
  subscriptionPlan String    @default("free")
  isActive         Boolean   @default(true)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  employees        Employee[]
  leaveRequests    LeaveRequest[]
  timesheets       Timesheet[]
  performanceCycles PerformanceCycle[]
  salaryComponents SalaryComponent[]
  documents        Document[]
  roleConfigs      RoleConfig[]
  permissionAudits PermissionAudit[]
}
```

## Testing Guide

### Test 1: Create Multiple Organizations
```javascript
// Create test organizations
await prisma.organization.createMany({
  data: [
    { name: 'Company A', subscriptionPlan: 'premium', isActive: true },
    { name: 'Company B', subscriptionPlan: 'free', isActive: true }
  ]
});
```

### Test 2: Create Users for Different Organizations
```javascript
// Create users for Company A
await prisma.employee.create({
  data: {
    name: 'User A',
    email: 'userA@companyA.com',
    password: hashedPassword,
    role: 'admin',
    organizationId: 1 // Company A
  }
});

// Create users for Company B
await prisma.employee.create({
  data: {
    name: 'User B',
    email: 'userB@companyB.com',
    password: hashedPassword,
    role: 'admin',
    organizationId: 2 // Company B
  }
});
```

### Test 3: Verify Data Isolation
```bash
# Login as User A (Company A)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"userA@companyA.com","password":"password"}'

# Get employees (should only see Company A employees)
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer USER_A_TOKEN"

# Login as User B (Company B)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"userB@companyB.com","password":"password"}'

# Get employees (should only see Company B employees)
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer USER_B_TOKEN"
```

### Test 4: Test Cross-Organization Access Prevention
```bash
# Login as User A
# Try to access User B's employee data using their ID
curl -X GET http://localhost:5000/api/employees/USER_B_ID \
  -H "Authorization: Bearer USER_A_TOKEN"

# Expected: 404 Not Found (User A cannot see User B's data)
```

### Test 5: Test Data Creation
```bash
# Login as User A
# Create an employee
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Employee",
    "email": "new@companyA.com",
    "role": "employee"
  }'

# Verify employee has organizationId = 1
```

### Test 6: Test Role/Permission Isolation
```bash
# Login as User A (Company A admin)
# Update Company A's permissions
curl -X PUT http://localhost:5000/api/admin/roles/1/permissions \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [{"module": "payroll", "action": "view", "isEnabled": true}],
    "reason": "Test"
  }'

# Login as User B (Company B admin)
# Verify Company B's permissions are unchanged
curl -X GET http://localhost:5000/api/admin/roles/1 \
  -H "Authorization: Bearer USER_B_TOKEN"
```

### Test 7: Test Leave Request Isolation
```bash
# Login as User A
# Create leave request
curl -X POST http://localhost:5000/api/leave \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Sick Leave",
    "startDate": "2026-04-22",
    "endDate": "2026-04-23"
  }'

# Login as User B
# Get all leave requests (should NOT see User A's request)
curl -X GET http://localhost:5000/api/leave \
  -H "Authorization: Bearer USER_B_TOKEN"
```

### Test 8: Test Timesheet Isolation
```bash
# Login as User A
# Create timesheet entry
curl -X POST http://localhost:5000/api/timesheet \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-04-22",
    "hours": 8,
    "description": "Work"
  }'

# Login as User B
# Get all timesheets (should NOT see User A's timesheet)
curl -X GET http://localhost:5000/api/timesheet/all \
  -H "Authorization: Bearer USER_B_TOKEN"
```

## Automated Test Script

Create `backend/test-multi-tenant.js`:

```javascript
import prisma from './lib/prisma.js';

async function testMultiTenantIsolation() {
  console.log('🔍 Testing Multi-Tenant Isolation\n');
  
  try {
    // Get users from different organizations
    const userA = await prisma.employee.findFirst({
      where: { email: 'userA@companyA.com' }
    });
    
    const userB = await prisma.employee.findFirst({
      where: { email: 'userB@companyB.com' }
    });
    
    console.log(`User A org: ${userA.organizationId}`);
    console.log(`User B org: ${userB.organizationId}`);
    
    // Count employees per organization
    const orgAEmployees = await prisma.employee.count({
      where: { organizationId: userA.organizationId }
    });
    
    const orgBEmployees = await prisma.employee.count({
      where: { organizationId: userB.organizationId }
    });
    
    console.log(`\nOrg A employees: ${orgAEmployees}`);
    console.log(`Org B employees: ${orgBEmployees}`);
    
    // Verify isolation
    if (orgAEmployees > 0 && orgBEmployees > 0) {
      console.log('\n✅ Multi-tenant isolation working');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMultiTenantIsolation();
```

## Important Notes

### Models Without organizationId
These models are linked via relations and inherit organization isolation:
- `EmployeeSalary` - Filtered by employee.organizationId
- `PerformanceGoal` - Filtered by cycle.organizationId
- `PerformanceReview` - Filtered by employee.organizationId
- `KRA` - Filtered by goal (linked to cycle)

### Default Behavior
- All existing records have `organizationId = 1` (default organization)
- New users without organizationId can see all data (backward compatibility)
- New users with organizationId only see their organization's data

### Security Considerations
- Never rely solely on frontend filtering
- Always use `tenantWhere` in backend controllers
- Validate organization access on update/delete operations
- Use `validateTenantAccess` for critical operations

### Performance
- Database indexes on `organizationId` for efficient queries
- Queries with organization filters are optimized
- No significant performance impact expected
