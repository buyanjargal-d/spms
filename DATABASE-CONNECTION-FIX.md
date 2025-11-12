# Database Connection SSL Fix

## Problem
The backend was failing with error:
```
The server does not support SSL connections
```

## Root Cause
You're using Supabase's **Transaction Pooler** (port 6543) which **does not support SSL connections**, but the code was configured to use SSL.

## Solution Applied
Updated `/home/buyaka/Desktop/spms/backend/src/config/database.ts` to automatically detect the connection type and disable SSL for Transaction Pooler.

## Supabase Connection Types

### Transaction Pooler (Port 6543)
- **URL**: `postgresql://postgres.xxx:password@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres`
- **SSL**: ❌ NOT SUPPORTED
- **Use Case**: High connection volume, short-lived queries
- **Max Connections**: Very high (pooled)

### Session Pooler (Port 5432)
- **URL**: `postgresql://postgres.xxx:password@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`
- **SSL**: ✅ REQUIRED
- **Use Case**: Long-lived connections, transactions
- **Max Connections**: Limited

### Direct Connection (Port 5432)
- **URL**: `postgresql://postgres:password@db.ypeushpkdsgekmlvcfwm.supabase.co:5432/postgres`
- **SSL**: ✅ REQUIRED
- **Use Case**: Full PostgreSQL features
- **Max Connections**: Very limited (recommended for migrations only)

## Current Configuration

Your current DATABASE_URL uses **Transaction Pooler (port 6543)**, which is good for production because:
- ✅ Handles many concurrent connections
- ✅ Fast query execution
- ✅ No SSL overhead
- ✅ Suitable for REST APIs

The code now automatically detects this and disables SSL.

## Alternative: Switch to Session Pooler

If you prefer to use SSL, update your DATABASE_URL to use port **5432**:

```bash
# In GitHub Secrets or .env file:
DATABASE_URL=postgresql://postgres.ypeushpkdsgekmlvcfwm:uqt1sU6QNVsyPYgd@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

The code will automatically enable SSL when it detects port 5432.

## How to Update

### Option 1: Keep Transaction Pooler (Recommended)
Just push the code changes - SSL is now automatically disabled for port 6543.

```bash
git add .
git commit -m "fix: automatically disable SSL for Supabase Transaction Pooler"
git push origin developer
```

### Option 2: Switch to Session Pooler
1. Update GitHub secret:
   ```bash
   ./scripts/add-github-secrets.sh
   # Or manually update EC2_HOST in GitHub settings
   ```

2. Change DATABASE_URL to use port 5432 instead of 6543

3. Push to deploy

## Verification

After deployment, check the logs:
```bash
ssh -i ~/Downloads/spms-backend.pem ubuntu@34.197.247.53 'cd ~/spms && docker compose logs backend | grep -i database'
```

You should see:
```
✅ Database connection established successfully
```

Instead of:
```
❌ Database connection failed: The server does not support SSL connections
```

## Testing

Test the backend health endpoint:
```bash
curl http://34.197.247.53:3000/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

## For Future Reference

When configuring Supabase connections:
- **Production API** → Use Transaction Pooler (6543) without SSL
- **Background Jobs** → Use Session Pooler (5432) with SSL
- **Database Migrations** → Use Direct Connection (5432) with SSL

## Related Files Modified
- `backend/src/config/database.ts` - Auto-detect SSL based on port
