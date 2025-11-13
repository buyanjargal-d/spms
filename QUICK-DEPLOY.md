# SPMS Quick Deployment Guide

Quick reference for deploying SPMS to production.

## Prerequisites Checklist

- [ ] Cloud server (Ubuntu/Amazon Linux) with Docker installed
- [ ] Domain name (optional, for SSL)
- [ ] Supabase account and database created
- [ ] GitHub repository with code
- [ ] SSH key for server access

## Step-by-Step Deployment

### 1. Prepare Server (First Time Only)

```bash
# From your local machine
chmod +x scripts/prepare-server.sh
./scripts/prepare-server.sh <SERVER_IP> <PEM_FILE>

# Example:
./scripts/prepare-server.sh 34.197.247.53 ~/.ssh/spms.pem
```

### 2. Setup GitHub Deploy Key (Private Repo Only)

```bash
# SSH to server
ssh -i your-key.pem ubuntu@your-server-ip

# Generate deploy key
ssh-keygen -t ed25519 -C "spms-deploy" -f ~/.ssh/spms-deploy

# Show public key
cat ~/.ssh/spms-deploy.pub
# Copy output and add to GitHub: Settings → Deploy keys

# Configure SSH
cat >> ~/.ssh/config << EOF
Host github.com
    IdentityFile ~/.ssh/spms-deploy
    StrictHostKeyChecking no
EOF
chmod 600 ~/.ssh/config
```

### 3. Configure GitHub Secrets

Go to GitHub repo → Settings → Secrets → Actions → New secret

Add these secrets:

```
EC2_HOST = your-server-ip
EC2_USERNAME = ubuntu
EC2_SSH_KEY = <paste entire private key from .pem file>
DATABASE_URL = postgresql://postgres.[ref]:[pass]@....supabase.com:5432/postgres
DIRECT_URL = postgresql://postgres.[ref]:[pass]@....supabase.com:5432/postgres
JWT_SECRET = <run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET = <run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_KEY = your-anon-key
ALLOWED_ORIGINS = https://yourdomain.com,http://your-server-ip
```

### 4. Deploy

**Option A: Push to GitHub (Automatic)**
```bash
git push origin main  # or developer branch
```

**Option B: Manual Deployment on Server**
```bash
# SSH to server
ssh -i your-key.pem ubuntu@your-server-ip

# Clone repo (first time)
git clone git@github.com:your-username/spms.git ~/spms
cd ~/spms

# Or pull updates
cd ~/spms
git pull origin main

# Create .env file
cp .env.production.example .env
nano .env  # Fill in your values

# Deploy
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps
```

### 5. Setup SSL (Optional but Recommended)

```bash
# SSH to server
ssh -i your-key.pem ubuntu@your-server-ip
cd ~/spms

# Run SSL setup
sudo chmod +x scripts/setup-ssl.sh
sudo ./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com
```

### 6. Verify Deployment

```bash
# Check containers
docker compose -f docker-compose.prod.yml ps

# Test endpoints
curl http://localhost:3000/health  # Backend
curl http://localhost/             # Frontend

# Or from browser
http://your-server-ip              # Frontend
http://your-server-ip:3000/health  # Backend API
```

## Common Commands

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services
```bash
# All services
docker compose -f docker-compose.prod.yml restart

# Specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Update Application
```bash
cd ~/spms
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

### Stop Services
```bash
docker compose -f docker-compose.prod.yml down
```

### Clean Up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

## Troubleshooting Quick Fixes

### Container won't start
```bash
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

### Database connection error
Check `.env` file has correct DATABASE_URL from Supabase

### Port already in use
```bash
sudo lsof -i :80
sudo lsof -i :3000
# Kill process or change port in docker-compose.prod.yml
```

### Out of disk space
```bash
docker system prune -a --volumes
df -h
```

### SSL not working
```bash
sudo certbot certificates
sudo certbot renew
docker compose -f docker-compose.prod.yml restart frontend
```

## URLs After Deployment

- **Frontend**: http://your-server-ip or https://yourdomain.com
- **Backend API**: http://your-server-ip:3000 or https://yourdomain.com/api
- **Health Check**: http://your-server-ip:3000/health

## Security Checklist

- [ ] SSH password authentication disabled
- [ ] Firewall configured (ports 22, 80, 443 only)
- [ ] Strong JWT secrets generated
- [ ] CORS origins properly configured
- [ ] SSL/HTTPS enabled (for production)
- [ ] Environment variables not committed to git
- [ ] Database backups enabled
- [ ] Container resource limits set

## Getting Help

- See full documentation: `DEPLOYMENT.md`
- Check logs: `docker compose -f docker-compose.prod.yml logs`
- GitHub Issues: https://github.com/your-username/spms/issues

---

**That's it! Your SPMS application should now be deployed and running.**
