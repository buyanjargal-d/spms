# GitHub Actions Deployment Setup Guide

This guide explains how to set up GitHub Actions to automatically deploy your SPMS backend as a Docker container to your cloud server.

## Prerequisites

1. A cloud server (AWS EC2, DigitalOcean, Linode, etc.) with:
   - Ubuntu/Amazon Linux OS
   - SSH access
   - Port 3000 open for backend API
   - At least 2GB RAM and 10GB storage

2. Your GitHub repository with the code pushed

## Step 1: Prepare Your Cloud Server

### 1.1 SSH Key Setup

On your cloud server, ensure you can SSH into it:

```bash
# From your local machine, test SSH connection
ssh your-username@your-server-ip
```

### 1.2 Get Your SSH Private Key

You'll need the private key that allows GitHub Actions to connect to your server:

```bash
# If you're using a .pem file (AWS EC2), view it:
cat ~/.ssh/your-key.pem

# If you're using id_rsa:
cat ~/.ssh/id_rsa
```

Copy the entire private key content (including `-----BEGIN ... KEY-----` and `-----END ... KEY-----`).

## Step 2: Configure GitHub Secrets

Go to your GitHub repository and set up the following secrets:

1. Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

2. Add the following secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `EC2_SSH_KEY` | Your SSH private key | Contents of your .pem or id_rsa file |
| `EC2_HOST` | Your server's IP address or domain | `52.12.34.56` or `spms.yourdomain.com` |
| `EC2_USER` | SSH username | `ubuntu` (Ubuntu) or `ec2-user` (Amazon Linux) |
| `DATABASE_URL` | Supabase database connection URL | `postgresql://postgres:[password]@[host]:5432/postgres` |
| `JWT_SECRET` | Secret for JWT tokens | Generate: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Generate: `openssl rand -base64 32` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Your Supabase anon/service key | From Supabase dashboard |

### How to Add Secrets:

1. Click **"New repository secret"**
2. Enter the secret name (exactly as shown above)
3. Paste the secret value
4. Click **"Add secret"**
5. Repeat for all secrets

## Step 3: Verify GitHub Actions Workflow

The workflow file is already created at `.github/workflows/deploy-backend.yml`. It will:

1. ✅ Trigger on pushes to `main` or `developer` branches
2. ✅ Trigger when backend files change
3. ✅ Connect to your server via SSH
4. ✅ Install Docker and Docker Compose (if needed)
5. ✅ Copy backend files to server
6. ✅ Create .env file with secrets
7. ✅ Build and deploy Docker containers
8. ✅ Run health checks

## Step 4: Prepare Your Server (First Time Only)

SSH into your server and ensure it's ready:

```bash
# Update system packages
sudo yum update -y  # For Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y  # For Ubuntu

# The workflow will auto-install Docker and Docker Compose
# But you can manually install if preferred:

# For Ubuntu:
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# For Amazon Linux:
sudo yum install -y docker
sudo service docker start
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Create deployment directory
mkdir -p ~/spms-backend/backend/logs
```

## Step 5: Configure Server Firewall

Ensure your server's firewall allows the necessary ports:

```bash
# For AWS EC2: Update Security Group in AWS Console
# Allow inbound traffic on:
# - Port 22 (SSH)
# - Port 3000 (Backend API)

# For Ubuntu with UFW:
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw enable

# For firewalld (CentOS/Amazon Linux):
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## Step 6: Trigger Deployment

Now that everything is set up, deployment will happen automatically:

### Automatic Deployment:

Every time you push to `developer` or `main` branch with changes to:
- `backend/**` files
- `docker-compose.yml`
- `.github/workflows/deploy-backend.yml`

GitHub Actions will automatically deploy to your server.

### Manual Deployment:

You can also trigger deployment manually:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **"Deploy Backend to AWS EC2"** workflow
4. Click **"Run workflow"** button
5. Select branch and click **"Run workflow"**

## Step 7: Monitor Deployment

1. Go to **Actions** tab in GitHub
2. Click on the running workflow
3. Watch the deployment progress in real-time
4. Check for any errors

## Step 8: Verify Deployment

After deployment completes, test your backend:

```bash
# Health check
curl http://your-server-ip:3000/health

# API test
curl http://your-server-ip:3000/api/students
```

## Step 9: View Logs on Server

If you need to debug, SSH into your server:

```bash
ssh your-username@your-server-ip

# Navigate to deployment directory
cd ~/spms-backend

# View running containers
sudo docker-compose ps

# View logs
sudo docker-compose logs -f backend

# Restart containers if needed
sudo docker-compose restart

# Stop containers
sudo docker-compose down

# Start containers
sudo docker-compose up -d
```

## Troubleshooting

### Issue: SSH Connection Failed

**Solution:** Check that:
- `EC2_SSH_KEY` secret contains the complete private key
- `EC2_HOST` is correct (IP or domain)
- `EC2_USER` is correct (`ubuntu` or `ec2-user`)
- Port 22 is open in firewall/security group

### Issue: Docker Not Found

**Solution:** The workflow auto-installs Docker. If it fails:
```bash
# SSH to server and manually install
sudo yum install -y docker  # Amazon Linux
sudo apt install -y docker.io  # Ubuntu

sudo service docker start
sudo systemctl enable docker
```

### Issue: Permission Denied

**Solution:** Add user to docker group:
```bash
sudo usermod -aG docker $USER
# Logout and login again
```

### Issue: Port 3000 Already in Use

**Solution:** Stop existing service:
```bash
sudo lsof -ti:3000 | xargs sudo kill -9
# OR
sudo docker-compose down
```

### Issue: Database Connection Failed

**Solution:** Verify secrets:
- Check `DATABASE_URL` format
- Ensure Supabase allows connections from your server IP
- Test connection manually:
```bash
# From server
curl "postgresql://user:pass@host:5432/dbname"
```

## Server Resource Requirements

**Minimum:**
- 1 CPU core
- 2GB RAM
- 10GB storage
- Ubuntu 20.04+ or Amazon Linux 2

**Recommended:**
- 2 CPU cores
- 4GB RAM
- 20GB storage
- Latest OS version

## Cost Estimates

**AWS EC2:**
- t2.small (2 vCPU, 2GB RAM): ~$17/month
- t2.medium (2 vCPU, 4GB RAM): ~$34/month

**DigitalOcean:**
- Basic Droplet (1 vCPU, 2GB RAM): $12/month
- Basic Droplet (2 vCPU, 4GB RAM): $24/month

**Note:** Plus bandwidth costs (usually ~$0.01/GB)

## Next Steps

1. ✅ Set up all GitHub secrets
2. ✅ Push code to trigger deployment
3. ✅ Monitor deployment in Actions tab
4. ✅ Test API endpoints
5. Set up custom domain (optional)
6. Set up SSL/HTTPS with Let's Encrypt (recommended)
7. Set up monitoring and alerts
8. Configure automated backups

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use strong JWT secrets** (32+ characters)
3. **Enable HTTPS** in production
4. **Restrict SSH access** to specific IPs if possible
5. **Keep server updated** with security patches
6. **Use Supabase Row Level Security** for database
7. **Set up automated backups** for database
8. **Monitor logs** regularly for suspicious activity

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Check server logs: `sudo docker-compose logs`
3. Verify all secrets are correctly set
4. Ensure server meets minimum requirements
5. Check firewall/security group settings

## Manual Deployment Alternative

If you prefer to deploy manually without GitHub Actions:

```bash
# On your server
git clone https://github.com/yourusername/spms.git
cd spms

# Create .env file
cat > backend/.env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
EOF

# Deploy with Docker Compose
sudo docker-compose up -d --build

# Check status
sudo docker-compose ps
sudo docker-compose logs -f
```

---

**Congratulations!** Your SPMS backend will now automatically deploy to your cloud server whenever you push changes to GitHub.
