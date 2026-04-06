/**
 * ABE (Attribute-Based Encryption) Policy Simulation
 * Evaluates whether a user's attributes satisfy an access policy.
 *
 * Policy format examples:
 *   "role=doctor"
 *   "role=doctor AND department=Cardiology"
 *   "role=admin OR role=doctor"
 */

function evaluatePolicy(policy, userAttributes) {
  if (!policy) return true;

  // Normalize
  const normalizedPolicy = policy.toLowerCase();
  const attrs = {};
  for (const [k, v] of Object.entries(userAttributes)) {
    attrs[k.toLowerCase()] = String(v).toLowerCase();
  }

  // Handle OR conditions
  if (normalizedPolicy.includes(' or ')) {
    const orParts = normalizedPolicy.split(' or ');
    return orParts.some(part => evaluateSingleCondition(part.trim(), attrs));
  }

  // Handle AND conditions
  if (normalizedPolicy.includes(' and ')) {
    const andParts = normalizedPolicy.split(' and ');
    return andParts.every(part => evaluateSingleCondition(part.trim(), attrs));
  }

  return evaluateSingleCondition(normalizedPolicy.trim(), attrs);
}

function evaluateSingleCondition(condition, attrs) {
  const [key, value] = condition.split('=').map(s => s.trim());
  if (!key || !value) return false;
  return attrs[key] === value;
}

module.exports = { evaluatePolicy };
