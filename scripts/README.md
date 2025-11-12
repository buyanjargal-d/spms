# SPMS Deployment Scripts

This directory contains scripts to help with server preparation and deployment.

## Quick Start (Fix Current Deployment Issue)

Your deployment is failing because of GitHub authentication. Run this one script to fix it:

```bash
./scripts/quick-deploy-fix.sh
```

This script will:
1. Connect to your server
2. Generate an SSH deploy key
3. Guide you to add it to GitHub
4. Test the connection
5. Clone/update the repository

**That's it!** After running this, your GitHub Actions deployments will work.

---

## Available Scripts

### 1. `quick-deploy-fix.sh` ⭐ (START HERE)
**Purpose**: Fix the current deployment authentication issue

**Usage**:
```bash
./scripts/quick-deploy-fix.sh
```

**What it does**:
- Sets up SSH deploy key on the server
- Guides you through adding it to GitHub
- Tests the connection
- Clones the repository

---

### 2. `prepare-server.sh`
**Purpose**: Prepare a fresh server for SPMS deployment

**Usage**:
```bash
./scripts/prepare-server.sh <SERVER_IP> <PEM_FILE>
```

**Example**:
```bash
./scripts/prepare-server.sh 34.197.247.53 ~/Downloads/spms-backend.pem
```

**What it does**:
- Updates system packages
- Installs Docker & Docker Compose
- Installs Git and other tools
- Configures firewall (UFW)
- Creates application directories
- Hardens SSH security
- Sets up swap space

---

### 3. `setup-deploy-key.sh`
**Purpose**: Set up GitHub deploy key for SSH authentication

**Usage**:
```bash
./scripts/setup-deploy-key.sh <SERVER_IP> <PEM_FILE>
```

**Example**:
```bash
./scripts/setup-deploy-key.sh 34.197.247.53 ~/Downloads/spms-backend.pem
```

**What it does**:
- Generates SSH key on server
- Configures SSH for GitHub
- Displays public key to add to GitHub

---

### 4. `add-github-secrets.sh`
**Purpose**: Update GitHub repository secrets for deployment

**Usage**:
```bash
./scripts/add-github-secrets.sh
```

**Requirements**:
- GitHub CLI (`gh`) must be installed
- Must be authenticated: `gh auth login`

**What it does**:
- Sets EC2_HOST secret (34.197.247.53)
- Sets EC2_USERNAME secret
- Sets EC2_SSH_KEY secret
- Sets database and JWT secrets
- Sets Supabase configuration

---

### 5. `deploy-manual.sh`
**Purpose**: Manually deploy the application (alternative to GitHub Actions)

**Usage**:
```bash
./scripts/deploy-manual.sh
```

**Configuration** (edit the script):
- EC2_HOST="34.197.247.53"
- EC2_USER="ubuntu"
- PEM_FILE="$HOME/Downloads/spms-backend.pem"

**What it does**:
- Tests SSH connection
- Copies backend files to server
- Copies docker-compose.yml
- Creates .env file
- Deploys with Docker Compose
- Runs health check

---

### 6. `check-deployment.sh`
**Purpose**: Check deployment status and troubleshoot

**Usage**:
```bash
./scripts/check-deployment.sh
```

**What it does**:
- Tests connection
- Checks Docker installation
- Shows container status
- Displays recent logs
- Runs health check
- Shows system resources
- Checks port status

---

### 7. `check-container-logs.sh`
**Purpose**: Analyze container logs (run on EC2 server)

**Usage** (on server):
```bash
cd ~/spms
./scripts/check-container-logs.sh
```

**What it does**:
- Shows container status
- Displays backend logs
- Displays frontend logs
- Tests API endpoints
- Checks compiled API URLs

---

### 8. `first-time-ec2-setup.sh`
**Purpose**: Set up EC2 instance for the first time (run on server)

**Usage** (on server):
```bash
./scripts/first-time-ec2-setup.sh
```

**What it does**:
- Installs Docker, Docker Compose, Git
- Clones repository
- Creates .env file
- Configures firewall

---

## Deployment Workflow

### Initial Setup (One Time)

1. **Prepare the server**:
   ```bash
   ./scripts/prepare-server.sh 34.197.247.53 ~/Downloads/spms-backend.pem
   ```

2. **Fix authentication** (THIS FIXES YOUR CURRENT ISSUE):
   ```bash
   ./scripts/quick-deploy-fix.sh
   ```

3. **Update GitHub secrets**:
   ```bash
   ./scripts/add-github-secrets.sh
   ```

4. **Push to deploy**:
   ```bash
   git push origin developer
   ```

### Daily Development

Just push to the `developer` or `main` branch:
```bash
git add .
git commit -m "your changes"
git push origin developer
```

GitHub Actions will automatically deploy to the server!

### Manual Deployment (If Needed)

```bash
./scripts/deploy-manual.sh
```

### Troubleshooting

```bash
./scripts/check-deployment.sh
```

Or SSH to the server and check:
```bash
ssh -i ~/Downloads/spms-backend.pem ubuntu@34.197.247.53
cd ~/spms
docker compose ps
docker compose logs -f
```

---

## Server Information

- **IP**: 34.197.247.53
- **User**: ubuntu
- **PEM File**: ~/Downloads/spms-backend.pem
- **App Directory**: ~/spms

## Application URLs

- **Frontend**: http://34.197.247.53
- **Backend**: http://34.197.247.53:3000
- **Health Check**: http://34.197.247.53:3000/health

---

## Common Issues

### Issue: "could not read Username for 'https://github.com'"
**Solution**: Run `./scripts/quick-deploy-fix.sh`

### Issue: "Permission denied (publickey)"
**Solution**: Make sure deploy key is added to GitHub with "Allow write access" checked

### Issue: Containers not starting
**Solution**:
```bash
./scripts/check-deployment.sh
```
Check logs and system resources

### Issue: Frontend can't connect to backend
**Solution**: Check if VITE_API_URL is set correctly in deployment

---

## Security Notes

- All scripts use SSH key authentication (no passwords)
- PEM file permissions are automatically set to 400
- Firewall is configured to only allow necessary ports
- Root login is disabled on the server
- SSH password authentication is disabled

---

## Need Help?

1. Check the main deployment guide: `../DEPLOYMENT-SETUP.md`
2. Run `./scripts/check-deployment.sh` to diagnose issues
3. Check GitHub Actions logs: https://github.com/buyanjargal-d/spms/actions
4. SSH to server and check logs: `docker compose logs -f`
