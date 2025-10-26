# Student Pickup Management System (SPMS) - Backend API

Backend API for the Student Pickup Management System (SPMS) demonstrating the paradigm shift from DevOps to DevSecOps.

**Thesis:** "DevOps"-с "DevSecOps" руу шилжих ухагдахууны өөрчлөлт  
**Author:** Дамдинсүрэнгийн Буянжаргал  
**University:** Монгол Улсын Их Сургууль  
**Date:** 2025-10

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20.x or higher
- PostgreSQL database (Supabase recommended)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd spms/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. **Configure database connection**

Update `.env` with your Supabase credentials:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
JWT_SECRET=your-secret-key-here
```

5. **Run the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # TypeORM database connection
│   │   └── env.ts        # Environment variables
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   │   ├── errorHandler.ts
│   │   └── notFoundHandler.ts
│   ├── models/           # TypeORM entities
│   │   ├── User.ts
│   │   ├── Student.ts
│   │   ├── Class.ts
│   │   ├── StudentGuardian.ts
│   │   └── PickupRequest.ts
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── student.routes.ts
│   │   └── pickup.routes.ts
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   │   └── logger.ts     # Winston logger
│   ├── validators/       # Input validation
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── tests/                # Test files
├── docs/                 # Documentation
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Compile TypeScript to JavaScript
npm start                # Run compiled code

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier

# Database
npm run typeorm          # Run TypeORM CLI commands
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert
```

---

## 📚 API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/v1/auth/login        # Login with DAN
POST /api/v1/auth/refresh      # Refresh token
POST /api/v1/auth/logout       # Logout
```

### Users
```
GET  /api/v1/users/me          # Get current user
GET  /api/v1/users             # Get all users (admin)
```

### Students
```
GET  /api/v1/students          # Get all students
GET  /api/v1/students/:id      # Get student by ID
GET  /api/v1/students/:id/guardians  # Get student guardians
```

### Pickup Requests
```
POST  /api/v1/pickup/request          # Create pickup request
GET   /api/v1/pickup/pending          # Get pending requests
PATCH /api/v1/pickup/:id/approve      # Approve request
PATCH /api/v1/pickup/:id/complete     # Complete pickup
GET   /api/v1/pickup/history          # Get history
```

---

## 🔐 Security Features (DevSecOps)

### Phase 1: DevOps (Basic Security)
- ✅ HTTPS/TLS encryption
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ JWT authentication

### Phase 2: DevSecOps (Enhanced Security)
- 🔄 SAST with SonarQube
- 🔄 Dependency scanning with Snyk
- 🔄 Container scanning with Trivy
- 🔄 DAST with OWASP ZAP
- 🔄 Secret scanning
- 🔄 Infrastructure as Code security

---

## 🗄️ Database Schema

See `/docs/database-schema.sql` for complete schema.

**Main Tables:**
- `users` - System users (admin, teacher, parent, guard)
- `students` - Student information
- `classes` - Class/grade information
- `student_guardians` - Student-guardian relationships
- `pickup_requests` - Pickup requests and history
- `notifications` - Push notifications
- `audit_logs` - Security audit trail

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.ts
```

---

## 📊 Logging

Logs are stored in `./logs/` directory:
- `error.log` - Error level logs
- `combined.log` - All logs

Winston logger with different levels:
- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `debug` - Debug messages (development only)

---

## 🐳 Docker Support

```bash
# Build image
docker build -t spms-api .

# Run container
docker run -p 3000:3000 --env-file .env spms-api

# Using Docker Compose
docker-compose up
```

---

## 🚀 Deployment

### Environment Variables Checklist
Before deploying, ensure these are set:
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `JWT_REFRESH_SECRET`
- ✅ `NODE_ENV=production`
- ✅ `ALLOWED_ORIGINS`

### Deployment Platforms
- AWS EC2/ECS
- Railway
- Render
- Heroku

---

## 📖 Development Guide

### Adding a New Feature

1. **Create model** (if needed)
```typescript
// src/models/NewEntity.ts
@Entity('new_entities')
export class NewEntity {
  // ...
}
```

2. **Create service**
```typescript
// src/services/newEntity.service.ts
export class NewEntityService {
  // Business logic
}
```

3. **Create controller**
```typescript
// src/controllers/newEntity.controller.ts
export class NewEntityController {
  // Route handlers
}
```

4. **Create routes**
```typescript
// src/routes/newEntity.routes.ts
router.get('/', controller.getAll);
```

5. **Add validation**
```typescript
// src/validators/newEntity.validator.ts
export const validateNewEntity = [
  // validation rules
];
```

6. **Write tests**
```typescript
// tests/newEntity.test.ts
describe('NewEntity', () => {
  // tests
});
```

---

## 🤝 Contributing

This is a bachelor's thesis project. For questions, contact:
- Author: Д.Буянжаргал
- Supervisor: Б.Батням

---

## 📝 License

MIT License - Educational purposes

---

## 🎯 Thesis Objectives

1. ✅ Demonstrate DevOps pipeline with CI/CD
2. ✅ Implement DevSecOps security scanning
3. ✅ Show "Shift Left" security principle
4. ✅ Compare Phase 1 (DevOps) vs Phase 2 (DevSecOps)
5. ✅ Document security improvements

---

## 📧 Support

For issues or questions:
- Create an issue in the repository
- Contact: buyanaa@example.mn
