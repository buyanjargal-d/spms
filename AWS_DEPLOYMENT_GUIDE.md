# AWS EC2 Deployment Guide for SPMS Backend

This guide will help you deploy the SPMS backend to AWS EC2 using GitHub Actions and Docker Compose.

## Prerequisites

- AWS EC2 instance running (Amazon Linux 2 or Ubuntu)
- EC2 IP Address: `3.94.130.22`
- PEM file: `~/Downloads/spms-backend.pem`
- GitHub repository with admin access

## Step 1: Prepare EC2 Instance

### 1.1 Set correct permissions for PEM file

```bash
chmod 400 ~/Downloads/spms-backend.pem
```

### 1.2 Connect to EC2 instance

```bash
ssh -i ~/Downloads/spms-backend.pem ec2-user@3.94.130.22
```

If using Ubuntu:
```bash
ssh -i ~/Downloads/spms-backend.pem ubuntu@3.94.130.22
```

### 1.3 Install Docker (if not already installed)

For Amazon Linux 2:
```bash
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
```

For Ubuntu:
```bash
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ubuntu
```

**Important**: Log out and log back in for group changes to take effect.

### 1.4 Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 1.5 Configure Security Group

In AWS Console, ensure your EC2 Security Group allows:
- Port 22 (SSH) - for deployment
- Port 3000 (HTTP) - for backend API
- Port 6379 (Redis) - optional, only if accessing externally

## Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

### Required Secrets:

1. **EC2_SSH_KEY**
   ```bash
   cat ~/Downloads/spms-backend.pem
   ```
   Copy the entire contents including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

2. **EC2_HOST**
   ```
   3.94.130.22
   ```

3. **EC2_USER**
   - For Amazon Linux 2: `ec2-user`
   - For Ubuntu: `ubuntu`

4. **DATABASE_URL**
   Your Supabase database connection string:
   ```
   postgresql://user:password@host:port/database
   ```

5. **JWT_SECRET**
   Generate a secure random string:
   ```bash
   openssl rand -base64 32
   ```

6. **JWT_REFRESH_SECRET**
   Generate another secure random string:
   ```bash
   openssl rand -base64 32
   ```

7. **SUPABASE_URL**
   Your Supabase project URL:
   ```
   https://your-project.supabase.co
   ```

8. **SUPABASE_KEY**
   Your Supabase anon/public key

## Step 3: Test Manual Deployment (Optional)

Before using GitHub Actions, you can test manual deployment:

### 3.1 Copy files to EC2

```bash
# From your local machine
cd ~/Desktop/spms

# Copy backend files
rsync -avz -e "ssh -i ~/Downloads/spms-backend.pem" \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.env' \
  ./backend/ ec2-user@3.94.130.22:~/spms-backend/backend/

# Copy docker-compose.yml
scp -i ~/Downloads/spms-backend.pem docker-compose.yml ec2-user@3.94.130.22:~/spms-backend/
```

### 3.2 Create .env file on EC2

SSH into EC2:
```bash
ssh -i ~/Downloads/spms-backend.pem ec2-user@3.94.130.22
```

Create .env file:
```bash
cd ~/spms-backend/backend
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
EOF
```

### 3.3 Deploy with Docker Compose

```bash
cd ~/spms-backend

# Build and start containers
sudo docker-compose up -d --build

# Check status
sudo docker-compose ps

# View logs
sudo docker-compose logs -f api

# Check health
curl http://localhost:3000/health
```

## Step 4: Deploy via GitHub Actions

### 4.1 Trigger Deployment

The GitHub Action will automatically deploy when you:
- Push to `main` or `developer` branch with changes in `backend/**`
- Manually trigger via GitHub Actions tab

### 4.2 Manual Trigger

1. Go to GitHub → Actions → "Deploy Backend to AWS EC2"
2. Click "Run workflow"
3. Select branch and click "Run workflow"

## Step 5: Verify Deployment

### 5.1 Check from EC2

SSH into your EC2 instance:
```bash
ssh -i ~/Downloads/spms-backend.pem ec2-user@3.94.130.22

# Check running containers
sudo docker-compose -f ~/spms-backend/docker-compose.yml ps

# View logs
sudo docker-compose -f ~/spms-backend/docker-compose.yml logs -f

# Check health
curl http://localhost:3000/health
```

### 5.2 Check from your local machine

```bash
# Health check
curl http://3.94.130.22:3000/health

# API endpoint test
curl http://3.94.130.22:3000/api/health
```

## Common Commands

### View logs
```bash
sudo docker-compose -f ~/spms-backend/docker-compose.yml logs -f api
```

### Restart services
```bash
sudo docker-compose -f ~/spms-backend/docker-compose.yml restart
```

### Stop services
```bash
sudo docker-compose -f ~/spms-backend/docker-compose.yml down
```

### Rebuild and restart
```bash
sudo docker-compose -f ~/spms-backend/docker-compose.yml down
sudo docker-compose -f ~/spms-backend/docker-compose.yml up -d --build
```

### Remove all containers and images
```bash
sudo docker-compose -f ~/spms-backend/docker-compose.yml down
sudo docker system prune -af
```

### View container details
```bash
sudo docker ps
sudo docker stats
sudo docker inspect spms-backend-api
```

## Troubleshooting

### Container not starting

```bash
# Check logs
sudo docker-compose logs api

# Check container status
sudo docker ps -a

# Inspect container
sudo docker inspect spms-backend-api
```

### Permission denied errors

```bash
# Ensure user is in docker group
sudo usermod -a -G docker $USER
# Log out and log back in

# Or use sudo
sudo docker-compose up -d
```

### Port already in use

```bash
# Check what's using port 3000
sudo lsof -i :3000
sudo netstat -tulpn | grep 3000

# Kill process if needed
sudo kill -9 <PID>
```

### Database connection issues

1. Check .env file has correct DATABASE_URL
2. Ensure Supabase allows connections from EC2 IP
3. Verify security group allows outbound connections

### GitHub Actions deployment fails

1. Check GitHub Secrets are set correctly
2. Verify EC2 security group allows SSH (port 22)
3. Check PEM key format in EC2_SSH_KEY secret
4. Review GitHub Actions logs for specific errors

## Security Best Practices

1. **Never commit sensitive data**
   - Keep .env files out of git
   - Use GitHub Secrets for credentials

2. **Restrict Security Group**
   - Only allow SSH from your IP
   - Use HTTPS in production (setup SSL/TLS)

3. **Update regularly**
   ```bash
   sudo yum update -y  # Amazon Linux
   sudo apt-get update && sudo apt-get upgrade -y  # Ubuntu
   ```

4. **Monitor logs**
   ```bash
   sudo docker-compose logs -f
   ```

5. **Setup CloudWatch** (optional)
   - Monitor EC2 metrics
   - Set up alarms for high CPU/memory usage

## Next Steps

1. Setup NGINX reverse proxy with SSL
2. Configure custom domain
3. Setup automated backups
4. Implement CI/CD testing before deployment
5. Add monitoring and alerting (CloudWatch, Prometheus, etc.)

## Support

For issues or questions:
- Check GitHub Actions logs
- Review Docker logs: `sudo docker-compose logs`
- Check EC2 system logs: `sudo tail -f /var/log/messages`
