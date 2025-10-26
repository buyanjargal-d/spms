import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { RequestType, RequestStatus } from '../models/PickupRequest';

export const createPickupRequestValidator = [
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required')
    .isUUID()
    .withMessage('Invalid student ID format'),

  body('requestType')
    .isIn(Object.values(RequestType))
    .withMessage('Invalid request type'),

  body('scheduledPickupTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for scheduled pickup time'),

  body('notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),

  body('specialInstructions')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Special instructions must not exceed 500 characters'),

  body('requestLocationLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),

  body('requestLocationLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),

  // Guest pickup validation
  body('guestName')
    .if(body('requestType').equals(RequestType.GUEST))
    .notEmpty()
    .withMessage('Guest name is required for guest pickup')
    .isLength({ max: 255 })
    .withMessage('Guest name must not exceed 255 characters'),

  body('guestPhone')
    .if(body('requestType').equals(RequestType.GUEST))
    .notEmpty()
    .withMessage('Guest phone is required for guest pickup')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),

  body('guestIdNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Guest ID number must not exceed 50 characters'),
];

export const updatePickupStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid pickup request ID'),

  body('status')
    .isIn(Object.values(RequestStatus))
    .withMessage('Invalid status'),

  body('rejectionReason')
    .if(body('status').equals(RequestStatus.REJECTED))
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting a request'),

  body('pickupPersonId')
    .optional()
    .isUUID()
    .withMessage('Invalid pickup person ID'),

  body('actualPickupTime')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for actual pickup time'),

  body('pickupLocationLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),

  body('pickupLocationLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
];

export const getPickupRequestsValidator = [
  query('status')
    .optional()
    .isIn(Object.values(RequestStatus))
    .withMessage('Invalid status filter'),

  query('studentId')
    .optional()
    .isUUID()
    .withMessage('Invalid student ID'),

  query('requestType')
    .optional()
    .isIn(Object.values(RequestType))
    .withMessage('Invalid request type filter'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const pickupIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid pickup request ID'),
];

// Validation middleware wrapper
export const validatePickupRequest = [
  ...createPickupRequestValidator,
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
