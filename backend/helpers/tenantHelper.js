// Helper functions for multi-tenant data isolation

// Returns a WHERE clause filter for tenant isolation.
//
// Resolution order:
//   1. req.activeOrgId   — set by auth middleware when a SuperAdmin sends a
//                          valid X-Organization-Id header (i.e. has "switched"
//                          into an org via the UI org-switcher). Takes
//                          precedence so a SuperAdmin acting inside an org
//                          sees ONLY that org's data.
//   2. req.user.organizationId — normal case for admin/employee/etc.
//   3. {}                — no scoping (SuperAdmin with no org selected,
//                          or legacy users without organizationId).
export const tenantWhere = (req) => {
  if (!req.user) {
    return {};
  }
  if (req.activeOrgId) {
    return { organizationId: req.activeOrgId };
  }
  if (!req.user.organizationId) {
    return {};
  }
  return { organizationId: req.user.organizationId };
};

// Returns a WHERE clause filter for tenant isolation with additional conditions
export const tenantWhereWith = (req, additionalWhere = {}) => {
  const baseWhere = tenantWhere(req);
  return { ...baseWhere, ...additionalWhere };
};

// Validates that a resource belongs to the user's organization
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
