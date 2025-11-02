import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

const auditService = new AuditService();

/**
 * Audit Logging Middleware
 *
 * Automatically logs all API requests for security and compliance
 * Implements thesis requirement Section 4.3.5 - Comprehensive Audit Logging
 *
 * Features:
 * - Logs all HTTP requests with metadata
 * - Captures user information from JWT
 * - Records IP address and user agent
 * - Tracks response status codes
 * - Logs errors and exceptions
 */

/**
 * Middleware to audit all API requests
 * Place this after authentication middleware to capture user info
 */
export const auditRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  const user = (req as any).user;

  // Store original res.json to intercept response
  const originalJson = res.json.bind(res);

  // Override res.json to capture response
  res.json = function (body: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;

    // Log the request (fire and forget - don't wait)
    auditService.log({
      userId: user?.id,
      action: mapMethodToAction(req.method),
      entityType: extractEntityType(req.path),
      entityId: extractEntityId(req.path, req.params),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      requestMethod: req.method,
      requestPath: req.path,
      statusCode,
      isError,
      errorMessage: isError ? body?.error || body?.message : undefined,
      description: `${req.method} ${req.path} - ${statusCode} (${duration}ms)`,
    }).catch((error) => {
      // Don't let audit logging break the app
      console.error('Failed to create audit log:', error);
    });

    return originalJson(body);
  };

  next();
};

/**
 * Map HTTP method to audit action
 */
function mapMethodToAction(method: string): any {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'CREATE'; // Default for GET and others
  }
}

/**
 * Extract entity type from request path
 */
function extractEntityType(path: string): any {
  // Parse entity type from path (e.g., /api/v1/pickup -> PickupRequest)
  const segments = path.split('/').filter((s) => s.length > 0);

  if (segments.includes('pickup') || segments.includes('pickup-requests')) {
    return 'PickupRequest';
  }
  if (segments.includes('guest-approvals')) {
    return 'GuestApproval';
  }
  if (segments.includes('students')) {
    return 'Student';
  }
  if (segments.includes('users')) {
    return 'User';
  }
  if (segments.includes('notifications')) {
    return 'Notification';
  }

  return 'User'; // Default
}

/**
 * Extract entity ID from request path or params
 */
function extractEntityId(path: string, params: any): string | undefined {
  // Try to find UUID in params
  const uuidRegex =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  // Check params first
  for (const key in params) {
    if (uuidRegex.test(params[key])) {
      return params[key];
    }
  }

  // Check path
  const match = path.match(uuidRegex);
  return match ? match[0] : undefined;
}

/**
 * Middleware specifically for sensitive operations
 * Use this for operations that absolutely must be audited
 */
export const auditSensitiveOperation = (
  action: string,
  entityType: string
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;

    // Log before the operation
    await auditService.log({
      userId: user?.id,
      action: action as any,
      entityType: entityType as any,
      entityId: req.params.id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      requestMethod: req.method,
      requestPath: req.path,
      description: `${action} on ${entityType}`,
    });

    next();
  };
};

/**
 * Middleware to audit login attempts
 */
export const auditLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    const success = res.statusCode === 200;
    const userId = body?.data?.user?.id;

    // Log login attempt
    if (success && userId) {
      auditService.logLogin(userId, {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        requestMethod: req.method,
        requestPath: req.path,
        statusCode: res.statusCode,
      }).catch((error) => {
        console.error('Failed to audit login:', error);
      });
    } else {
      auditService.log({
        action: 'LOGIN' as any,
        entityType: 'User' as any,
        isError: true,
        errorMessage: body?.error || 'Login failed',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        requestMethod: req.method,
        requestPath: req.path,
        statusCode: res.statusCode,
      }).catch((error) => {
        console.error('Failed to audit failed login:', error);
      });
    }

    return originalJson(body);
  };

  next();
};
