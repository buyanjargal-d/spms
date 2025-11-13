# SPMS Cloud Deployment Guide

Complete guide for deploying SPMS (Student Pickup Management System) to cloud infrastructure using Docker and GitHub Actions.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Cloud Deployment](#cloud-deployment)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Overview

The SPMS deployment architecture consists of:

- **Frontend**: React/Vite app served by Nginx
- **Backend**: Node.js/Express API
- **Database**: Supabase (managed PostgreSQL)
- **Cache**: Redis
- **Deployment**: Docker Compose + GitHub Actions
- **SSL/TLS**: Let's Encrypt (optional)

## Prerequisites

### Local Development Requirements

- Node.js 20+
- Docker and Docker Compose
- Git

### Cloud Server Requirements

- Ubuntu 20.04+ or Amazon Linux 2
- Minimum 2GB RAM, 2 vCPU
- Docker and Docker Compose installed
- SSH access with key-based authentication
- Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/your-username/spms.git
cd spms
```

### 2. Setup Environment

```bash
# Copy local environment template
cp .env.local.example .env

# Edit .env with your local configuration
nano .env
```

### 3. Start Local Development

Using Docker Compose (recommended):

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Manual setup:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### 4. Access Application

- Frontend: http://localhost:5173 (dev) or http://localhost (Docker)
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/v1/docs

## Cloud Deployment

### 1. Server Preparation

Run the server preparation script on your local machine:

```bash
chmod +x scripts/prepare-server.sh
./scripts/prepare-server.sh <SERVER_IP> <PEM_FILE_PATH>
```

Example:
```bash
./scripts/prepare-server.sh 34.197.247.53 ~/.ssh/spms-backend.pem
```

This script will:
- Install Docker and Docker Compose
- Install Git and essential tools
- Configure firewall
- Setup security hardening
- Create application directory structure

### 2. Setup GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `EC2_HOST` | Your server IP or domain | `34.197.247.53` |
| `EC2_USERNAME` | SSH username | `ubuntu` or `ec2-user` |
| `EC2_SSH_KEY` | Private SSH key content | Contents of your .pem file |
| `EC2_SSH_PORT` | SSH port (optional) | `22` |
| `DATABASE_URL` | Supabase database URL | `postgresql://...` |
| `DIRECT_URL` | Direct database URL | `postgresql://...` |
| `JWT_SECRET` | JWT secret key | Generate with crypto |
| `JWT_REFRESH_SECRET` | JWT refresh secret | Generate with crypto |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key | `eyJ...` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://yourdomain.com` |

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Setup SSH Deploy Key (for private repos)

On your server:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "spms-deploy-key" -f ~/.ssh/spms-deploy

# Display public key
cat ~/.ssh/spms-deploy.pub
```

Add the public key to your GitHub repository:
- Go to Repository → Settings → Deploy keys
- Add new deploy key
- Paste the public key
- Enable "Allow write access" (if needed)

Configure SSH on server:

```bash
# Add to SSH config
cat >> ~/.ssh/config << EOF
Host github.com
    IdentityFile ~/.ssh/spms-deploy
    StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config
```

### 4. Deploy via GitHub Actions

**Automatic Deployment:**

Push to `main` or `developer` branch:

```bash
git push origin main
```

The GitHub Actions workflow will automatically:
1. Build and test the application
2. Deploy to your cloud server
3. Run health checks
4. Show deployment status

**Manual Deployment:**

Go to Actions tab → Deploy to Cloud → Run workflow

### 5. Verify Deployment

```bash
# SSH to server
ssh -i your-key.pem ubuntu@your-server-ip

# Check running containers
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check health
curl http://localhost:3000/health
curl http://localhost/
```

## SSL/HTTPS Setup

### Prerequisites

- A domain name pointing to your server
- Port 80 and 443 accessible

### Setup Let's Encrypt SSL

```bash
# SSH to server
ssh -i your-key.pem ubuntu@your-server-ip

# Run SSL setup script
cd ~/spms
sudo chmod +x scripts/setup-ssl.sh
sudo ./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com
```

The script will:
- Install Certbot
- Obtain SSL certificates
- Configure auto-renewal
- Update nginx for HTTPS
- Restart containers

### Manual SSL Configuration

If you have your own certificates:

```bash
# Copy certificates to server
scp fullchain.pem ubuntu@server:/home/ubuntu/spms/nginx/ssl/
scp privkey.pem ubuntu@server:/home/ubuntu/spms/nginx/ssl/

# SSH to server and set permissions
ssh ubuntu@server
cd ~/spms/nginx/ssl
chmod 644 fullchain.pem
chmod 600 privkey.pem

# Edit nginx config to enable HTTPS block
nano frontend/nginx.conf
# Uncomment the HTTPS server block

# Restart containers
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend
```

### Certificate Renewal

Automatic renewal is configured via cron. To test:

```bash
sudo certbot renew --dry-run
```

## GitHub Secrets Configuration

### Required Secrets

Create these in GitHub repository settings:

```bash
# Server Access
EC2_HOST=your-server-ip-or-domain
EC2_USERNAME=ubuntu
EC2_SSH_KEY=<paste entire private key>
EC2_SSH_PORT=22

# Database (Supabase)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-64-char-hex-string
JWT_REFRESH_SECRET=your-64-char-hex-string

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,http://your-ip
```

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f redis

# Backend application logs
docker compose -f docker-compose.prod.yml exec backend tail -f /app/logs/app.log
```

### Monitor Resources

```bash
# Container stats
docker stats

# Disk usage
docker system df
df -h

# Clean up
docker system prune -a
docker volume prune
```

### Database Backups

```bash
# Backup Supabase database (from server)
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql

# Or use Supabase dashboard for automated backups
```

### Update Application

Updates are automatic via GitHub Actions. To manually update:

```bash
cd ~/spms
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

## Troubleshooting

### Container Won't Start

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# View detailed logs
docker compose -f docker-compose.prod.yml logs backend

# Check health
docker inspect spms-backend | grep -A 10 Health
```

### Database Connection Issues

```bash
# Test database connection
docker compose -f docker-compose.prod.yml exec backend node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => console.log('Connected')).catch(e => console.error(e));
"
```

### Nginx/Frontend Issues

```bash
# Test nginx config
docker compose -f docker-compose.prod.yml exec frontend nginx -t

# Reload nginx
docker compose -f docker-compose.prod.yml exec frontend nginx -s reload

# Check nginx logs
docker compose -f docker-compose.prod.yml logs frontend
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check nginx SSL config
docker compose -f docker-compose.prod.yml exec frontend nginx -T | grep ssl
```

### High Memory Usage

```bash
# Limit container memory in docker-compose.prod.yml
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 256m
  redis:
    mem_limit: 256m
```

### Port Conflicts

```bash
# Check what's using a port
sudo lsof -i :80
sudo lsof -i :3000

# Stop conflicting service
sudo systemctl stop apache2  # or nginx, etc.
```

### GitHub Actions Failing

1. Check workflow logs in GitHub Actions tab
2. Verify all secrets are set correctly
3. Ensure SSH key has correct permissions
4. Test SSH connection manually:
   ```bash
   ssh -i <key> ubuntu@<server-ip> "echo 'Connection successful'"
   ```

## Production Checklist

Before going to production:

- [ ] Domain name configured and pointing to server
- [ ] SSL certificates installed and auto-renewal configured
- [ ] All environment variables properly set in GitHub Secrets
- [ ] Database backups configured (Supabase auto-backups)
- [ ] Monitoring setup (logs, metrics)
- [ ] CORS origins properly configured
- [ ] Security groups/firewall configured (only 80, 443, 22)
- [ ] SSH password authentication disabled
- [ ] Container resource limits set
- [ ] Log rotation configured
- [ ] Health check endpoints working
- [ ] Error handling tested
- [ ] Load testing completed

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-username/spms/issues
- Documentation: See README.md

## License

MIT License - see LICENSE file for details
