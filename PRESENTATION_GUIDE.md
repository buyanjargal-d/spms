# SPMS Presentation Guide - Tomorrow's Defense

## Quick Start for Presentation

### 1. Demo Credentials (All passwords: `123456`)

| Role | DAN ID | Description |
|------|--------|-------------|
| Admin | admin001 | Full system access |
| Teacher | teacher001 | Batbayar Dorj - Class 1-A |
| Teacher | teacher002 | Sarangerel Gan - Class 2-B |
| Parent | parent001 | Parent of Bold student |
| Guard | guard001 | Security guard |

### 2. System is Pre-Seeded with Demo Data

✅ **Already populated:**
- 1 Admin user
- 2 Teachers
- 12 Parents
- 1 Guard
- 12 Students across 2 classes
- 8 Pickup requests (3 completed, 3 approved, 2 pending)

**Note:** Demo data is already in the database. No need to reseed.

### 3. Starting the System for Demo

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)  
cd frontend
npm run dev
```

Access at: http://localhost:5173

## Key Features to Demonstrate

### Section 1-4: Core Functionality ✅

1. **Login System** (`/login`)
   - Show role-based button cards (Admin, Teacher, Parent, Guard)
   - Login as different roles
   - Remember Me functionality

2. **Parent Pickup Request** (`/pickup/create`)
   - Login as `parent001` / `123456`
   - Create new pickup request
   - Show validation and form features

3. **Teacher Approval** (`/pickup/requests`)
   - Login as `teacher001` / `123456`
   - View pending requests
   - Approve or reject with reasons

4. **Guard Completion** (`/guard/pickups`)
   - Login as `guard001` / `123456`
   - View approved pickups
   - Complete pickup verification

### Section 5: Advanced Features ✅

5. **QR Code Verification**
   - Show QR code generation for approved pickups
   - Demonstrate QR scanning by guard
   - Time-limited QR codes (15 min expiry)

6. **Session Management**
   - Show Remember Me extending session
   - Demonstrate session persistence
   - Show account lockout (5 failed attempts)

### Section 6: Admin Functionality ✅

7. **User Management** (`/admin/users`)
   - Login as `admin001` / `123456`
   - View all users with filters
   - Add new user (show validation)
   - Edit user information
   - Toggle user status (active/inactive)
   - Reset password
   - Unlock locked accounts

8. **Student Management** (`/students`)
   - View students by class
   - Add new student with medical info
   - Link students to parents/guardians
   - View student details

### Section 7: Reports & Analytics ✅

9. **Reports Dashboard** (`/reports`)
   - Daily pickup report
   - Monthly statistics
   - Student history report
   - Show backend report generation

## DevOps/DevSecOps Evidence

### CI/CD Pipeline ✅

**Location:** `.github/workflows/`
- `backend-ci.yml` - Backend pipeline with security scanning
- `frontend-ci.yml` - Frontend pipeline with build optimization

**Pipeline Stages:**
1. Security vulnerability scanning (Trivy)
2. Lint & code quality checks
3. Unit tests with coverage
4. Docker image build
5. Automated deployment (staging/production)

**Show judges:**
```bash
cat .github/workflows/backend-ci.yml
```

### Docker Deployment ✅

**Location:** `docker-compose.yml`

**Services:**
- PostgreSQL database (with health checks)
- Redis cache
- Backend API
- Frontend (optional)
- Nginx reverse proxy

**Show judges:**
```bash
cat docker-compose.yml
docker-compose up -d  # If time permits
```

### Security Documentation ✅

**Location:** `SECURITY.md` (comprehensive 300+ line document)

**Covers:**
- Security architecture (Defense in Depth)
- Authentication & Authorization (JWT, RBAC)
- Data protection (encryption at rest/transit)
- Security features (rate limiting, XSS, CSRF, SQL injection prevention)
- DevSecOps practices (SSDLC, security scanning)
- Vulnerability management
- Incident response
- Compliance (OWASP Top 10, GDPR)

**Show judges:**
```bash
cat SECURITY.md | head -100  # Show first 100 lines
```

## Key Technical Achievements to Highlight

### 1. Full-Stack TypeScript Implementation
- **Backend:** Node.js + Express + TypeORM
- **Frontend:** React + Vite
- **Database:** PostgreSQL with TypeORM migrations
- **Type Safety:** End-to-end type checking

### 2. Security Best Practices
- Password hashing (bcrypt, 10 salt rounds)
- JWT authentication with secure sessions
- Role-based access control (RBAC)
- Account lockout protection
- Rate limiting (5 login attempts per 15 min)
- Audit logging (immutable logs)
- QR code encryption with time limits

### 3. Database Design
- UUID primary keys
- Proper foreign key relationships
- Enum types for status
- Audit trail with triggers
- Migration system for version control

### 4. DevOps Implementation
- CI/CD pipelines (GitHub Actions)
- Docker containerization
- Multi-stage Docker builds
- Health checks
- Environment-based configuration
- Automated testing in pipeline

### 5. Code Quality
- ESLint + Prettier
- TypeScript strict mode
- Comprehensive error handling
- Input validation (express-validator)
- Parameterized queries (SQL injection prevention)

## Demo Flow Suggestion (15-20 minutes)

### Phase 1: Core Functionality (5 min)
1. Show login page with role cards
2. Login as parent → Create pickup request
3. Login as teacher → Approve request
4. Login as guard → Complete pickup
5. Show audit logs in background

### Phase 2: Advanced Features (5 min)
1. Show QR code generation
2. Demonstrate session management
3. Show account lockout feature
4. Display pickup history

### Phase 3: Admin & Reports (5 min)
1. Login as admin
2. User management (add/edit/deactivate)
3. Student management
4. Reports dashboard (daily, monthly)

### Phase 4: DevOps/Security (5 min)
1. Show CI/CD pipeline configuration
2. Explain docker-compose setup
3. Highlight SECURITY.md key points:
   - Defense in Depth architecture
   - Authentication flow diagram
   - Security testing examples
   - Compliance checklist

## Troubleshooting

### If Backend Won't Start
```bash
cd backend
npm install
npm run build
npm run dev
```

### If Frontend Won't Start
```bash
cd frontend
npm install
npm run dev
```

### If Database Connection Fails
Check `.env` file has correct `DATABASE_URL`

### If Demo Data Missing
```bash
cd backend
npm run seed:demo
```

## Questions Judges Might Ask

### Technical Questions

**Q: How do you prevent SQL injection?**
A: We use TypeORM with parameterized queries. All user input is sanitized and never directly concatenated into SQL strings.

```typescript
// Safe: TypeORM automatically parameterizes
await userRepo.findOne({ where: { danId: userInput } });
```

**Q: How is password security handled?**
A: Passwords are hashed using bcrypt with 10 salt rounds. We never store plaintext passwords. Account lockout after 5 failed attempts.

**Q: What security measures are in place?**
A: Multiple layers:
- JWT authentication with secure sessions
- Role-based access control (RBAC)
- Rate limiting (prevents brute force)
- Audit logging (immutable)
- HTTPS/TLS encryption
- Helmet security headers
- Input validation and sanitization

**Q: How do you handle CI/CD?**
A: GitHub Actions pipelines with:
- Automated security scanning (Trivy)
- Lint and code quality checks
- Unit tests with coverage
- Docker image building
- Environment-based deployment

**Q: What's your deployment strategy?**
A: Docker containerization with docker-compose:
- PostgreSQL for data persistence
- Redis for caching
- Multi-stage builds for optimization
- Health checks for all services
- Non-root container execution

### DevOps Questions

**Q: How do you ensure code quality?**
A: 
- TypeScript strict mode
- ESLint + Prettier
- Pre-commit hooks
- Code reviews
- Automated testing in CI

**Q: What monitoring do you have?**
A:
- Winston logging (JSON format)
- Audit trail (all sensitive operations)
- Health check endpoints
- Rate limit monitoring

**Q: How do you handle secrets?**
A:
- Environment variables (.env files)
- Never committed to Git
- GitHub Secrets for CI/CD
- Rotation policy (90 days)

## Final Checklist Before Presentation

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can login as admin001 / 123456
- [ ] Demo data visible (students, requests)
- [ ] Have SECURITY.md open in editor
- [ ] Have docker-compose.yml visible
- [ ] Have CI/CD workflow visible
- [ ] Network connection stable
- [ ] Browser dev tools ready (to show network requests)

## Backup Plan

If live demo fails:
1. Have screenshots ready
2. Show code in editor
3. Walk through architecture diagrams
4. Explain from SECURITY.md
5. Show GitHub repository structure

---

**Good luck with your presentation! You've got this! 🎉**

**Remember:** The system is complete, well-architected, and demonstrates both DevOps and DevSecOps practices comprehensively.
