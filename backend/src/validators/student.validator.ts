import { param, query } from 'express-validator';

export const studentIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid student ID'),
];

export const studentQueryValidator = [
  query('classId')
    .optional()
    .isUUID()
    .withMessage('Invalid class ID'),

  query('gradeLevel')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Grade level must be between 1 and 12'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  query('search')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
];
