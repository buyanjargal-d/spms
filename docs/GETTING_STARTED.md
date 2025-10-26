# 🚀 Getting Started Guide

## Step-by-Step Setup Instructions

### Step 1: Download and Extract the Project

1. Download the project ZIP file
2. Extract to your desired location (e.g., `C:\Projects` or `~/Projects`)
3. Open terminal/command prompt in the project folder

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

**Expected output:**
```
added 250 packages, and audited 251 packages in 15s
```

### Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` in your text editor and update:

```env
# Update these with your Supabase credentials
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres

# Generate secure JWT secrets (use: https://generate-secret.vercel.app/32)
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here

# For development, keep these as default
USE_MOCK_DAN=true
NODE_ENV=development
PORT=3000
```

### Step 4: Verify Database Connection

Create a test file `test-db.js` in the backend folder:

```javascript
const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Database connected successfully!');
    
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Tables found:', tables.rows.length);
    tables.rows.forEach(row => console.log('  -', row.table_name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();
```

Run the test:
```bash
node test-db.js
```

**Expected output:**
```
✅ Database connected successfully!
Database: postgres
User: postgres
Tables found: 10
  - audit_logs
  - classes
  - notifications
  - pickup_requests
  - students
  - student_guardians
  - users
  ...
```

### Step 5: Run the Development Server

```bash
npm run dev
```

**Expected output:**
```
[nodemon] starting `ts-node src/server.ts`
✅ Environment variables validated
✅ Database connection established successfully
📊 Database: postgres
🚀 Server is running on port 3000
📝 Environment: development
🌐 API Base URL: http://localhost:3000/api/v1
🏥 Health check: http://localhost:3000/health
```

### Step 6: Test the API

Open your browser or use curl:

**Test 1: Health Check**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-26T10:30:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

**Test 2: Root Endpoint**
```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "message": "Student Handover System API",
  "version": "1.0.0",
  "thesis": "Paradigm shift from DevOps to DevSecOps",
  "author": "Д.Буянжаргал",
  "documentation": "/api/v1/docs"
}
```

**Test 3: Auth Endpoint (placeholder)**
```bash
curl http://localhost:3000/api/v1/auth/login -X POST
```

Expected response:
```json
{
  "message": "Login endpoint - to be implemented"
}
```

---

## 🎯 What We've Accomplished So Far

✅ **Project Structure** - Complete folder organization  
✅ **TypeScript Configuration** - Strict type checking enabled  
✅ **Database Models** - User, Student, PickupRequest entities  
✅ **Express Server** - With security middleware (Helmet, CORS)  
✅ **Environment Configuration** - Centralized config management  
✅ **Logging** - Winston logger with file rotation  
✅ **Error Handling** - Global error handler  
✅ **API Routes** - Placeholder endpoints for all features  
✅ **Docker Support** - Dockerfile and docker-compose  
✅ **CI/CD Pipeline** - GitHub Actions workflow (Phase 1)  

---

## 📋 Next Steps (Your Action Items)

### Week 1: Backend Core Features

1. **Implement Authentication**
   - [ ] Create DAN mock service
   - [ ] JWT token generation/validation
   - [ ] Auth middleware
   - [ ] Login/logout endpoints

2. **Implement User Management**
   - [ ] Get current user
   - [ ] Update user profile
   - [ ] List users (admin)

3. **Implement Student Management**
   - [ ] List students
   - [ ] Get student details
   - [ ] Get student guardians
   - [ ] Add/remove guardians

### Week 2: Pickup Request Features

4. **Implement Pickup Request Flow**
   - [ ] Create pickup request (UC-001)
   - [ ] Standard pickup with GPS (UC-002)
   - [ ] Approve/reject request (UC-003)
   - [ ] Manual/guest registration (UC-004, UC-005)
   - [ ] Complete pickup
   - [ ] View history

5. **Implement GPS Validation**
   - [ ] Check if user is within school radius
   - [ ] Store GPS coordinates
   - [ ] Calculate distance

6. **Implement Notifications**
   - [ ] Firebase Cloud Messaging setup
   - [ ] Send notification on request
   - [ ] Send notification on approval
   - [ ] Mark as read

### Week 3: Testing & Documentation

7. **Write Tests**
   - [ ] Unit tests for services
   - [ ] Integration tests for API endpoints
   - [ ] Test coverage > 70%

8. **API Documentation**
   - [ ] Add Swagger/OpenAPI
   - [ ] Document all endpoints
   - [ ] Add request/response examples

### Week 4: Phase 1 Complete, Start Phase 2

9. **Complete DevOps Pipeline**
   - [ ] Deploy to staging
   - [ ] Smoke tests
   - [ ] Deploy to production

10. **Start DevSecOps Integration**
    - [ ] Add SonarQube
    - [ ] Add Snyk
    - [ ] Add Trivy
    - [ ] Add OWASP ZAP

---

## 🛠️ Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
1. Check your DATABASE_URL in `.env`
2. Verify Supabase project is active
3. Check firewall/network settings
4. Try DIRECT_URL instead

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Issue: "Module not found"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "TypeScript errors"
**Solution:**
```bash
npm run build
# Fix any errors shown
```

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Compile TypeScript
npm start                # Run production build

# Testing
npm test                 # Run tests once
npm run test:watch       # Watch mode

# Code Quality
npm run lint             # Check code
npm run lint:fix         # Auto-fix
npm run format           # Prettier

# Docker
docker-compose up        # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs

# Database
npm run typeorm migration:generate -- -n AddNewField
npm run typeorm migration:run
```

---

## 🎓 Learning Resources

**TypeScript:**
- https://www.typescriptlang.org/docs/

**TypeORM:**
- https://typeorm.io/

**Express.js:**
- https://expressjs.com/

**DevSecOps:**
- https://owasp.org/
- https://docs.github.com/en/actions

---

## ✅ Checklist Before Starting Development

- [ ] All dependencies installed (`node_modules` folder exists)
- [ ] `.env` file configured with database credentials
- [ ] Database connection tested successfully
- [ ] Server starts without errors
- [ ] Health check endpoint returns 200
- [ ] VS Code extensions installed (ESLint, Prettier)
- [ ] Git repository initialized
- [ ] Supabase database has all tables

**Status: Ready to code! 🎉**

---

## 📞 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in console
3. Check logs in `./logs/` folder
4. Verify environment variables
5. Test database connection separately

**Common first-time issues:**
- Forgot to create `.env` file
- Wrong database credentials
- Port already in use
- Missing Node.js/npm installation

---

**Next:** Start implementing authentication in `src/services/auth.service.ts` and `src/controllers/auth.controller.ts`
