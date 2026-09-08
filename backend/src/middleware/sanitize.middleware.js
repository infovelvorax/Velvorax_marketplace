import mongoose from 'mongoose';

/**
 * Recursive sanitizer to strip NoSQL injection operators ($gt, $ne, $where, $regex, etc.)
 * from object keys in request bodies, queries, and parameters.
 */
function cleanNoSqlOperators(target) {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map(item => cleanNoSqlOperators(item));
  }

  const cleaned = {};
  for (const key of Object.keys(target)) {
    // Strip keys that start with $ (MongoDB operators) or contain . (nested path injection)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    const val = target[key];
    if (val && typeof val === 'object') {
      cleaned[key] = cleanNoSqlOperators(val);
    } else if (typeof val === 'string') {
      // Strip null bytes and control characters
      cleaned[key] = val.replace(/\0/g, '');
    } else {
      cleaned[key] = val;
    }
  }

  return cleaned;
}

/**
 * Express middleware to sanitize all incoming requests
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanNoSqlOperators(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = cleanNoSqlOperators(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = cleanNoSqlOperators(req.params);
  }
  next();
};

/**
 * Middleware factory to validate MongoDB ObjectId parameters in route URLs
 * e.g. router.get('/:id', validateObjectId('id'), getHandler)
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format for parameter: ${paramName}`
      });
    }
    next();
  };
};

export default { sanitizeInput, validateObjectId };
