// ── Subscription / paywall guard ─────────────────────────────────────────
// Two pieces are exported:
//
// 1. requireSubscription  — middleware for LIST-style routes that filter by
//    a company passed in params/query/body (e.g. GET /api/questions?company=X).
//    It fails CLOSED: if no company can be identified, access is denied
//    rather than silently allowed (the old version fell through to next()
//    whenever companyId was missing, which meant unfiltered list requests
//    bypassed the paywall entirely).
//
// 2. checkCompanyAccess   — a plain function for routes that fetch a single
//    resource by id first (e.g. GET /api/questions/:id, POST /coding/submit).
//    Call it AFTER loading the resource, using the resource's own `company`
//    field, since the route params don't carry the company id in those cases.

const hasActiveAccess = (user, companyId) => {
  // Premium always has access, as long as the plan hasn't expired.
  if (user.subscription.expiresAt && user.subscription.expiresAt < new Date()) {
    return { ok: false, code: 'SUBSCRIPTION_EXPIRED', message: 'Subscription expired. Please renew.' };
  }
  if (user.subscription.plan === 'premium') return { ok: true };

  if (!companyId) {
    return { ok: false, code: 'COMPANY_REQUIRED', message: 'A company must be specified to access this content.' };
  }
  if (!user.hasAccessToCompany(companyId)) {
    return { ok: false, code: 'ACCESS_DENIED', message: 'Please purchase this company pack to access content.' };
  }
  return { ok: true };
};

const requireSubscription = (req, res, next) => {
  const user = req.user;
  const companyId = req.params.companyId || req.body.companyId || req.query.company || req.query.companyId;

  const result = hasActiveAccess(user, companyId);
  if (!result.ok) return res.status(403).json({ success: false, message: result.message, code: result.code });
  next();
};

// Returns true/false — use inside a controller once you have the resource's
// company id, e.g.:
//   if (!checkCompanyAccess(req.user, problem.company)) return res.status(403)...
const checkCompanyAccess = (user, companyId) => hasActiveAccess(user, companyId).ok;

module.exports = { requireSubscription, checkCompanyAccess };
