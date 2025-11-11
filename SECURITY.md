# Security Policy - Student Pickup Management System (SPMS)

## Table of Contents
1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection](#data-protection)
5. [Security Features](#security-features)
6. [DevSecOps Practices](#devsecops-practices)
7. [Vulnerability Management](#vulnerability-management)
8. [Incident Response](#incident-response)
9. [Compliance](#compliance)

## Overview

This document outlines the security measures, practices, and policies implemented in the Student Pickup Management System (SPMS). The system handles sensitive data related to students, parents, and school operations, requiring robust security controls.

**Security Classification:** HIGH
**Last Updated:** 2025-11-11
**Version:** 1.0

## Security Architecture

### Defense in Depth Strategy

The SPMS implements multiple layers of security controls:

```
┌─────────────────────────────────────────┐
│   Application Layer (Rate Limiting)    │
├─────────────────────────────────────────┤
│   Authentication (JWT + Session)       │
├─────────────────────────────────────────┤
│   Authorization (RBAC)                  │
├─────────────────────────────────────────┤
│   Data Validation & Sanitization       │
├─────────────────────────────────────────┤
│   Database Security (Encryption)        │
├─────────────────────────────────────────┤
│   Network Security (HTTPS/TLS)         │
├─────────────────────────────────────────┤
│   Infrastructure (Docker/Firewall)      │
└─────────────────────────────────────────┘
```

### System Components Security

1. **Frontend Security**
   - Content Security Policy (CSP)
   - XSS Protection
   - CSRF Token validation
   - Secure cookie handling
   - Input sanitization

2. **Backend Security**
   - Helmet.js security headers
   - Rate limiting per endpoint
   - Request validation (express-validator)
   - SQL injection prevention (TypeORM)
   - NoSQL injection prevention

3. **Database Security**
   - Encrypted connections (SSL/TLS)
   - Parameterized queries only
   - Audit logging (immutable)
   - Role-based database access
   - Automated backups

## Authentication & Authorization

### Multi-Factor Authentication Flow

```typescript
┌──────────┐    Login Request    ┌──────────────┐
│  Client  │ ──────────────────> │   Auth API   │
└──────────┘                      └──────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────┐
                           │  1. Verify Credentials  │
                           │  2. Check Account Lock  │
                           │  3. Rate Limit Check    │
                           └─────────────────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────┐
                           │  Generate JWT + Session │
                           │  Set Secure Cookies     │
                           │  Log Audit Trail        │
                           └─────────────────────────┘
```

### Implemented Security Features

#### 1. Password Security
- **Hashing Algorithm:** bcrypt with salt rounds = 10
- **Minimum Requirements:** 
  - Length: 8+ characters
  - Complexity: Mixed case, numbers (configurable)
- **Password Reset:** Time-limited tokens (1 hour expiry)

```typescript
// Backend: src/middleware/auth.ts
const hashedPassword = await bcrypt.hash(password, 10);
```

#### 2. Account Protection
- **Failed Login Attempts:** Max 5 attempts
- **Account Lockout:** 15 minutes after 5 failed attempts
- **Progressive Delays:** Exponential backoff on failed attempts

```typescript
// Backend: src/services/auth.service.ts:138
if (user.failedLoginAttempts >= 5) {
  throw new Error('Account locked due to too many failed attempts');
}
```

#### 3. Session Management
- **JWT Tokens:** RS256 algorithm (asymmetric)
- **Token Expiry:** 7 days (configurable)
- **Refresh Tokens:** Secure, HttpOnly cookies
- **Remember Me:** Extended session with enhanced security

```typescript
// Backend: src/middleware/auth.ts:52
const token = jwt.sign(
  { userId: user.id, role: user.role, sessionId },
  jwtSecret,
  { expiresIn: '7d', algorithm: 'HS256' }
);
```

#### 4. Role-Based Access Control (RBAC)

| Role    | Permissions |
|---------|-------------|
| Admin   | Full system access, user management, reports |
| Teacher | Approve/reject pickups, view class students |
| Parent  | Create pickup requests, view own children |
| Guard   | Complete pickups, scan QR codes |

```typescript
// Backend: src/middleware/auth.ts:80
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

## Data Protection

### Data Classification

| Category | Classification | Protection Level |
|----------|---------------|------------------|
| Student PII | CRITICAL | Encrypted at rest + transit |
| Parent Contact | HIGH | Encrypted at rest + transit |
| Pickup Records | HIGH | Encrypted + Audit logged |
| Login Credentials | CRITICAL | Hashed (bcrypt) + Secure storage |
| Session Data | HIGH | Encrypted, HttpOnly cookies |

### Encryption Standards

1. **Data in Transit**
   - TLS 1.3 (minimum TLS 1.2)
   - HTTPS enforced for all connections
   - Certificate pinning (mobile apps)

2. **Data at Rest**
   - PostgreSQL encryption enabled
   - Sensitive fields encrypted (AES-256)
   - Encrypted backups

3. **Password Storage**
   ```typescript
   // Never store plaintext passwords
   password: bcrypt.hashSync(plaintext, 10)
   ```

### Data Sanitization

```typescript
// Backend: Input validation example
import { body, validationResult } from 'express-validator';

export const validatePickupRequest = [
  body('studentId').isUUID(),
  body('scheduledPickupTime').isISO8601(),
  body('notes').optional().trim().escape(),
];
```

## Security Features

### 1. Request Rate Limiting

Protection against brute force and DDoS attacks:

```typescript
// Backend: src/middleware/rateLimiter.ts
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 2. SQL Injection Prevention

Using TypeORM with parameterized queries:

```typescript
// SAFE: TypeORM automatically parameterizes
await userRepo.findOne({ where: { danId: userInput } });

// UNSAFE (NOT USED): Raw queries without parameters
// await connection.query(`SELECT * FROM users WHERE dan_id = '${userInput}'`);
```

### 3. Cross-Site Scripting (XSS) Protection

```typescript
// Backend: Helmet security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  xssFilter: true,
}));

// Frontend: React automatically escapes JSX
<p>{userInput}</p> // Safe - automatically escaped
```

### 4. Cross-Site Request Forgery (CSRF) Protection

```typescript
// CSRF token validation
import csrf from 'csurf';
const csrfProtection = csrf({ cookie: true });

app.post('/api/v1/pickup/request', csrfProtection, createPickupRequest);
```

### 5. Audit Logging (Immutable)

All critical operations are logged immutably:

```sql
-- PostgreSQL trigger preventing audit log modification
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be updated';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
```

```typescript
// Backend: src/utils/auditLogger.ts
export const logAuditEvent = async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  ipAddress: string
) => {
  await auditLogRepo.save({
    userId,
    action,
    resourceType,
    resourceId,
    ipAddress,
    timestamp: new Date(),
  });
};
```

### 6. QR Code Security (Section 5)

```typescript
// Time-limited QR codes with encryption
const qrCodeToken = crypto.randomBytes(32).toString('hex');
const qrExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

const qrCodeData = JSON.stringify({
  requestId: pickupRequest.id,
  token: qrCodeToken,
  expiresAt: qrExpiresAt,
});

// Verify QR code
if (new Date() > qrExpiresAt) {
  throw new Error('QR code has expired');
}
```

## DevSecOps Practices

### Secure Software Development Lifecycle (SSDLC)

```
┌──────────────┐
│   Plan       │ ← Threat Modeling
├──────────────┤
│   Develop    │ ← Secure Coding Standards
├──────────────┤
│   Build      │ ← SAST (Static Analysis)
├──────────────┤
│   Test       │ ← DAST, Penetration Testing
├──────────────┤
│   Deploy     │ ← Security Scanning, HTTPS
├──────────────┤
│   Monitor    │ ← SIEM, Audit Logs
└──────────────┘
```

### CI/CD Security Pipeline

Our GitHub Actions workflows include:

1. **Static Analysis (SAST)**
   - ESLint security rules
   - TypeScript strict mode
   - npm audit for vulnerabilities

2. **Dependency Scanning**
   - Trivy vulnerability scanner
   - Automated dependency updates (Dependabot)

3. **Container Security**
   - Docker image scanning (Trivy)
   - Non-root container execution
   - Minimal base images (Alpine)

```yaml
# .github/workflows/backend-ci.yml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    severity: 'CRITICAL,HIGH'
```

### Secret Management

- **Environment Variables:** Never committed to Git
- **.env.example:** Template without sensitive values
- **Production Secrets:** Stored in secure vault (GitHub Secrets)
- **Rotation Policy:** Credentials rotated every 90 days

```bash
# .gitignore includes:
.env
.env.local
.env.production
*.pem
*.key
```

### Secure Defaults

```typescript
// Backend: Secure configuration defaults
const config = {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  helmet: {
    contentSecurityPolicy: true,
    xssFilter: true,
    noSniff: true,
    hsts: { maxAge: 31536000 },
  },
  rateLimit: {
    enabled: true,
    max: 100,
  },
};
```

## Vulnerability Management

### Vulnerability Reporting

If you discover a security vulnerability, please:

1. **DO NOT** open a public GitHub issue
2. Email: security@spms.mn
3. Include:
   - Detailed description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

### Response Timeline

| Severity | Response Time | Fix Timeline |
|----------|--------------|--------------|
| Critical | 4 hours | 24 hours |
| High | 24 hours | 7 days |
| Medium | 7 days | 30 days |
| Low | 30 days | 90 days |

### Security Updates

- **Automated Scanning:** Daily vulnerability checks
- **Dependency Updates:** Weekly automated PRs
- **Security Patches:** Applied within 48 hours
- **Version Updates:** Quarterly security review

## Incident Response

### Security Incident Plan

1. **Detection** → Automated monitoring + manual reports
2. **Containment** → Isolate affected systems
3. **Investigation** → Analyze logs, determine scope
4. **Remediation** → Apply patches, restore systems
5. **Post-Mortem** → Document lessons learned

### Contact Information

- **Security Team:** security@spms.mn
- **Emergency Hotline:** +976-XXXX-XXXX
- **Incident Response:** incident@spms.mn

## Compliance

### Standards Adherence

| Standard | Status | Notes |
|----------|--------|-------|
| OWASP Top 10 | ✅ Compliant | All mitigations implemented |
| ISO 27001 | 🔄 In Progress | Information security management |
| GDPR | ✅ Compliant | Data protection (if applicable) |
| PCI DSS | N/A | No payment card data handled |

### Data Protection Regulations

- **Data Minimization:** Collect only necessary information
- **Right to Access:** Users can request their data
- **Right to Deletion:** Data deletion upon request
- **Data Portability:** Export data in standard format
- **Breach Notification:** Within 72 hours of discovery

### Audit Compliance

```typescript
// Backend: All sensitive operations audited
await logAuditEvent(
  req.user.id,
  'CREATE_PICKUP_REQUEST',
  'PickupRequest',
  newRequest.id,
  req.ip
);
```

## Security Testing

### Regular Security Assessments

1. **Automated Tests** (Daily)
   - Unit tests with security assertions
   - Integration tests for auth flows
   - npm audit for vulnerabilities

2. **Manual Testing** (Monthly)
   - Code reviews with security focus
   - Authentication bypass attempts
   - Authorization boundary testing

3. **External Audits** (Annually)
   - Third-party penetration testing
   - Security architecture review
   - Compliance assessment

### Security Test Cases

```typescript
// Example: Authentication security test
describe('Authentication Security', () => {
  test('should prevent SQL injection in login', async () => {
    const maliciousInput = "' OR '1'='1";
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ danId: maliciousInput, password: 'any' });
    
    expect(response.status).toBe(401);
  });

  test('should lock account after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await attemptLogin('user001', 'wrongpassword');
    }
    
    const response = await attemptLogin('user001', 'correctpassword');
    expect(response.status).toBe(423); // Locked
  });
});
```

## Security Checklist

### Deployment Security Checklist

- [ ] All environment variables configured
- [ ] HTTPS/TLS certificates installed
- [ ] Database encryption enabled
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Audit logging active
- [ ] Backup system operational
- [ ] Monitoring alerts configured
- [ ] Security headers enabled (Helmet)
- [ ] CORS properly configured
- [ ] Session secrets rotated
- [ ] Default credentials changed
- [ ] Unnecessary services disabled
- [ ] Security scanning scheduled

## Monitoring & Alerting

### Security Monitoring

```typescript
// Backend: Security event monitoring
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'warn' 
    }),
  ],
});

// Log security events
securityLogger.warn('Failed login attempt', {
  danId: req.body.danId,
  ip: req.ip,
  timestamp: new Date(),
});
```

### Alert Thresholds

| Event | Threshold | Action |
|-------|-----------|--------|
| Failed logins | 10/minute | Alert admin + IP block |
| API errors | 50/minute | Alert developer team |
| Database errors | 5/minute | Alert ops team |
| Unauthorized access | 1 event | Immediate alert |

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Document Version:** 1.0  
**Last Review:** 2025-11-11  
**Next Review:** 2025-12-11  
**Approved By:** Д.Буянжаргал (System Architect)
