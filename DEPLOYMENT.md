# SPMS Deployment Guide - GitHub Actions + Docker + AWS EC2

This guide will help you deploy the SPMS application (frontend + backend) to a single AWS EC2 instance using GitHub Actions and Docker.

## Architecture Overview

- **Frontend**: React/Vite app served by Nginx (Port 80)
- **Backend**: Node.js/Express API (Port 3000)
- **Redis**: Cache service (Port 6379)
- **Deployment**: Automated via GitHub Actions
- **Server**: Single AWS EC2 instance running Docker containers

## Prerequisites

- AWS EC2 instance (Ubuntu 20.04+ or Amazon Linux 2)
- GitHub repository with this code
- Domain name (optional, but recommended)

## Step 1: Set Up AWS EC2 Instance

### 1.1 Launch EC2 Instance

1. Go to AWS EC2 Console
2. Click "Launch Instance"
3. Choose AMI: **Ubuntu Server 22.04 LTS** (recommended) or **Amazon Linux 2023**
4. Instance Type: **t2.small** or larger (t2.micro may run out of memory)
5. Configure Security Group:
   - SSH (22): Your IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0 (if using SSL)
   - Custom TCP (3000): 0.0.0.0/0 (Backend API)
   - Custom TCP (6379): 127.0.0.1/32 (Redis - localhost only)
6. Create/select a key pair and download the `.pem` file

### 1.2 Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 1.3 Run Setup Script

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/spms/main/scripts/setup-ec2.sh -o setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh

# Logout and login again for Docker permissions
exit
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 1.4 Verify Installation

```bash
docker --version
docker-compose --version
git --version
```

## Step 2: Configure GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

### Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `EC2_HOST` | EC2 instance public IP | `54.123.45.67` |
| `EC2_USERNAME` | EC2 SSH username | `ubuntu` or `ec2-user` |
| `EC2_SSH_KEY` | Private key content from `.pem` file | (full content of .pem file) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT secret key | `your-secret-key-here` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | `your-refresh-secret-here` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon/public key | `eyJhbGc...` |

### Optional Secrets

| Secret Name | Description | Default |
|------------|-------------|---------|
| `EC2_SSH_PORT` | SSH port | `22` |

### How to Get EC2_SSH_KEY

```bash
# On your local machine, display the private key content
cat your-key.pem

# Copy the ENTIRE output including the BEGIN and END lines
# Paste it into GitHub Secrets as EC2_SSH_KEY
```

## Step 3: Choose Deployment Method

You have two deployment workflows:

### Option A: Simple Deployment (Recommended for beginners)

**File**: `.github/workflows/deploy-simple.yml`

- Builds Docker images on EC2 server
- Simpler setup, no AWS ECR needed
- Slower initial deployment
- Good for small to medium projects

### Option B: ECR Deployment (Recommended for production)

**File**: `.github/workflows/deploy.yml`

- Builds Docker images in GitHub Actions
- Pushes to Amazon ECR (Elastic Container Registry)
- Faster deployments
- Better for production and larger teams
- Requires additional AWS setup (see Step 4)

**To use Simple Deployment**: No additional steps needed, it's ready to use!

**To use ECR Deployment**: Continue to Step 4.

## Step 4: ECR Deployment Setup (Optional)

If you want to use the ECR deployment method:

### 4.1 Create ECR Repositories

```bash
aws ecr create-repository --repository-name spms-backend --region YOUR_REGION
aws ecr create-repository --repository-name spms-frontend --region YOUR_REGION
```

### 4.2 Add Additional GitHub Secrets

| Secret Name | Description |
|------------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_REGION` | AWS region (e.g., `us-east-1`) |

### 4.3 Configure EC2 IAM Role

Your EC2 instance needs permissions to pull from ECR:

1. Create IAM role with policy: `AmazonEC2ContainerRegistryReadOnly`
2. Attach role to EC2 instance

### 4.4 Disable Simple Deployment

Rename or delete `.github/workflows/deploy-simple.yml` to avoid conflicts.

## Step 5: Initial Deployment

### 5.1 Manual First Deployment (Recommended)

SSH into your EC2 instance and do a manual deployment first:

```bash
# Clone repository
cd ~
git clone https://github.com/YOUR_USERNAME/spms.git
cd spms

# Create backend .env file
nano backend/.env
```

Add your environment variables:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGc...
```

```bash
# Build and start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5.2 Automated Deployment via GitHub Actions

Once manual deployment works:

```bash
# Push to main or developer branch
git add .
git commit -m "Deploy to production"
git push origin developer
```

GitHub Actions will automatically:
1. Build Docker images
2. SSH into EC2
3. Pull latest code
4. Restart containers

## Step 6: Verify Deployment

### Check Application

- Frontend: `http://YOUR_EC2_PUBLIC_IP`
- Backend API: `http://YOUR_EC2_PUBLIC_IP:3000`
- Health check: `http://YOUR_EC2_PUBLIC_IP:3000/health`

### Check Containers

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
docker-compose ps
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Troubleshooting Commands

```bash
# View all containers
docker ps -a

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# Check disk space
df -h

# Check memory
free -h

# Remove unused Docker images
docker system prune -a
```

## Step 7: Domain Setup (Optional)

### 7.1 Configure DNS

Point your domain to EC2 public IP:
- A record: `example.com` → `YOUR_EC2_PUBLIC_IP`
- A record: `api.example.com` → `YOUR_EC2_PUBLIC_IP`

### 7.2 Set Up SSL with Let's Encrypt

```bash
# Install certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Stop frontend container temporarily
docker-compose stop frontend

# Get SSL certificate
sudo certbot certonly --standalone -d example.com -d www.example.com

# Update nginx.conf to use SSL (edit frontend/nginx.conf)
# Restart containers
docker-compose up -d
```

## Step 8: Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Update Application

```bash
# SSH to EC2
cd ~/spms
git pull origin main
docker-compose up -d --build
```

### Backup Important Data

```bash
# Backup logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz backend/logs/

# Copy to S3 (if configured)
aws s3 cp logs-backup-*.tar.gz s3://your-bucket/backups/
```

### Monitor Resources

```bash
# CPU and Memory
htop

# Disk usage
df -h

# Docker stats
docker stats

# Check container health
docker-compose ps
```

## Workflow Triggers

Deployments are triggered on:
- Push to `main` branch
- Push to `developer` branch
- Manual trigger via GitHub Actions UI

## Security Best Practices

1. ✅ Keep EC2 security group restricted
2. ✅ Use environment variables for secrets
3. ✅ Enable AWS CloudWatch for monitoring
4. ✅ Regular security updates: `sudo apt-get update && sudo apt-get upgrade`
5. ✅ Use SSL/TLS in production
6. ✅ Implement rate limiting
7. ✅ Regular backups
8. ✅ Use IAM roles instead of access keys when possible

## Cost Optimization

- Use **t3.small** or **t3a.small** (cheaper than t2)
- Enable EC2 Auto Scaling if traffic varies
- Use **Reserved Instances** for production (save up to 72%)
- Set up **CloudWatch alarms** for cost monitoring
- **Stop instances** during non-business hours (dev/staging)

## Common Issues

### Issue: Out of Memory

```bash
# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Issue: Port Already in Use

```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :3000

# Kill process
sudo kill -9 PID
```

### Issue: Docker Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

### Issue: GitHub Actions Can't Connect

- Verify EC2_SSH_KEY is complete (including BEGIN/END lines)
- Check EC2 security group allows SSH from GitHub Actions IPs
- Verify EC2_HOST is the public IP, not private IP

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review GitHub Actions workflow runs
3. Check EC2 instance status in AWS Console

## Next Steps

- [ ] Set up domain name
- [ ] Configure SSL certificate
- [ ] Set up monitoring (AWS CloudWatch, Datadog, etc.)
- [ ] Configure automatic backups
- [ ] Set up staging environment
- [ ] Implement blue-green deployment
- [ ] Add CDN (CloudFront)
- [ ] Set up database backups

---

**Happy Deploying! 🚀**
