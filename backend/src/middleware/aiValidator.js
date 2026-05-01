/**
 * Middleware to validate AI prompt inputs for security and operational stability.
 */
const aiValidator = (req, res, next) => {
  const { input } = req.body || {};

  if (input === undefined || input === null) {
    return res.status(400).json({ error: 'Input is required for workflow execution.' });
  }

  const trimmedInput = String(input).trim();

  // Reject empty inputs
  if (!trimmedInput) {
    return res.status(400).json({ error: 'Operational Block: Input cannot be empty.' });
  }

  // Enforce maximum length to prevent cost/resource exhaustion attacks
  const MAX_LENGTH = 4000;
  if (trimmedInput.length > MAX_LENGTH) {
    return res.status(400).json({ 
      error: `Security Block: Input exceeds maximum allowed length of ${MAX_LENGTH} characters.` 
    });
  }

  // Basic sanitization: Remove potentially harmful script tags
  const sanitizedInput = trimmedInput
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, '')
    .replace(/<[^>]*>?/gm, '');

  // Update request body with sanitized input
  req.body.input = sanitizedInput;

  next();
};

module.exports = aiValidator;
