import { body, validationResult } from 'express-validator';
import xss from 'xss';

const ALLOWED_PERSONAS = ["firstTimeVoter", "seasonedVoter", "nriVoter", "candidate", "default"];

export const validateChatInput = [
  body("message")
    .exists().withMessage("Message is required")
    .isString().withMessage("Message must be a string")
    .isLength({ min: 1, max: 1000 }).withMessage("Message must be between 1 and 1000 characters")
    .customSanitizer((value) => xss(value)),

  body("persona")
    .exists().withMessage("Persona is required")
    .isIn(ALLOWED_PERSONAS).withMessage("Invalid persona"),

  body("history")
    .optional()
    .isArray().withMessage("History must be an array")
    .isLength({ max: 50 }).withMessage("History too long"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
];

export const validateMythInput = [
  body("message") // Note: The user's routes use 'message' but their snippet used 'myth'. I'll stick to 'message' as per the existing code.
    .exists().withMessage("Myth is required")
    .isString()
    .isLength({ min: 1, max: 1000 }).withMessage("Myth must be under 1000 characters")
    .customSanitizer((value) => xss(value)),

  body("persona")
    .optional()
    .isIn(ALLOWED_PERSONAS).withMessage("Invalid persona"),

  body("history").optional().isArray(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
];
