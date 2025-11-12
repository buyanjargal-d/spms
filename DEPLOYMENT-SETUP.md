# SPMS Deployment Setup Guide

## Quick Fix for Current Issue

Your deployment is failing because the GitHub repository requires authentication. Follow these steps:

### Step 1: Prepare the Server

First, run the server preparation script:

```bash
cd ~/Desktop/spms
./scripts/prepare-server.sh 34.197.247.53 ~/Downloads/spms-backend.pem
```

This will install Docker, Docker Compose, Git, and configure the server.

### Step 2: Setup GitHub Deploy Key

Run the deploy key setup script:

```bash
./scripts/setup-deploy-key.sh 34.197.247.53 ~/Downloads/spms-backend.pem
```

This will:
1. Generate an SSH key on the server
2. Display the public key that you need to add to GitHub

### Step 3: Add Deploy Key to GitHub

1. Copy the public key shown by the script
2. Go to: https://github.com/buyanjargal-d/spms/settings/keys
3. Click **"Add deploy key"**
4. Set title: `SPMS EC2 Production Server`
5. Paste the public key
6. ✅ **Check "Allow write access"** (important!)
7. Click **"Add key"**

### Step 4: Test the Connection

```bash
ssh -i ~/Downloads/spms-backend.pem ubuntu@34.197.247.53 'ssh -T git@github.com'
```

You should see: `Hi buyanjargal-d/spms! You've successfully authenticated...`

### Step 5: Update GitHub Secrets

Run the script to update GitHub secrets with the new server IP:

```bash
./scripts/add-github-secrets.sh
```

Or manually update `EC2_HOST` in GitHub:
- Go to: https://github.com/buyanjargal-d/spms/settings/secrets/actions
- Update `EC2_HOST` to: `34.197.247.53`

### Step 6: Push to Deploy

Now commit the changes and push:

```bash
git add .
git commit -m "fix: configure deployment for new server with SSH authentication"
git push origin developer
```

The GitHub Actions workflow will now successfully deploy to your server!

---

## Alternative: Make Repository Public

If you don't want to use deploy keys, you can make the repository public:

1. Go to: https://github.com/buyanjargal-d/spms/settings
2. Scroll down to "Danger Zone"
3. Click "Change visibility" → "Make public"

Then the deployment will work without SSH keys.

---

## Server Information

- **Server IP**: 34.197.247.53
- **User**: ubuntu
- **PEM File**: ~/Downloads/spms-backend.pem
- **Application Directory**: ~/spms
- **Logs Directory**: ~/spms/backend/logs

## Useful Commands

### Connect to Server
```bash
ssh -i ~/Downloads/spms-backend.pem ubuntu@34.197.247.53
```

### View Logs
```bash
ssh -i ~/Downloads/spms-backend.pem ubuntu@34.197.247.53 'cd ~/spms && docker compose logs -f'
```

### Check Status
```bash
ssh -i ~/Downloads/spms-backend.pem ubuntu@34.197.247.53 'cd ~/spms && docker compose ps'
```

### Restart Services
```bash
ssh -i ~/Downloads/spms-backend.pem ubuntu@34.197.247.53 'cd ~/spms && docker compose restart'
```

### Manual Deployment
```bash
ssh -i ~/Downloads/spms-backend.pem ubuntu@34.197.247.53 'cd ~/spms && git pull && docker compose up -d --build'
```

## Ports Configuration

Make sure these ports are open in AWS Security Group:

- **22** - SSH
- **80** - HTTP (Frontend)
- **443** - HTTPS (SSL)
- **3000** - Backend API
- **5432** - PostgreSQL (optional, only if external access needed)
- **6379** - Redis (optional, only if external access needed)

## Application URLs

- **Frontend**: http://34.197.247.53
- **Backend API**: http://34.197.247.53:3000
- **Health Check**: http://34.197.247.53:3000/health

## Troubleshooting

### Deployment Fails with "could not read Username"
This means the deploy key is not set up. Follow Steps 2-4 above.

### "Permission denied (publickey)"
The SSH key is not added to GitHub, or "Allow write access" was not checked.

### Containers not starting
Check logs: `docker compose logs -f`
Check disk space: `df -h`
Check memory: `free -h`

### Frontend shows "Cannot connect to server"
1. Check if backend is running: `curl http://localhost:3000/health`
2. Check backend logs: `docker compose logs backend`
3. Verify VITE_API_URL is set correctly in deployment

### Database connection errors
1. Check DATABASE_URL secret in GitHub
2. Verify Supabase database is accessible
3. Check backend logs for specific error

## Security Notes

- SSH password authentication is disabled (key-only)
- Root login is disabled
- Firewall (UFW) is configured
- Docker containers run with minimal privileges
- Environment variables are stored as GitHub secrets

## Backup Recommendations

1. **Database**: Set up automated Supabase backups
2. **Docker Volumes**: Backup `/var/lib/docker/volumes/`
3. **Application**: Code is in GitHub (already backed up)
4. **Logs**: Archived in `~/spms/backend/logs`

## Monitoring Recommendations

- Set up CloudWatch for EC2 metrics
- Configure log aggregation (CloudWatch Logs, ELK, etc.)
- Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- Configure alerting for errors and downtime
