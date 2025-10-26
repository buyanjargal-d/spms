import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const loginValidator = [
  body('danId')
    .trim()
    .notEmpty()
    .withMessage('DAN ID is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('DAN ID must be between 3 and 50 characters'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const refreshTokenValidator = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required'),
];

// Validation middleware wrapper
export const validateLogin = [
  ...loginValidator,
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        errors: errors.array(),
      });
      return;
    }
    next();
  },
];
