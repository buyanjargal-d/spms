# Quick Deployment Checklist

## One-Time EC2 Setup

```bash
# 1. SSH to your EC2 instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# 2. Run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/spms/main/scripts/setup-ec2.sh -o setup.sh
chmod +x setup.sh
./setup.sh

# 3. Logout and login
exit
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# 4. Clone repository
git clone https://github.com/YOUR_USERNAME/spms.git ~/spms
cd ~/spms

# 5. Create backend/.env file
nano backend/.env
# Add your environment variables (see DEPLOYMENT.md)

# 6. Start containers
docker-compose up -d

# 7. Verify
docker-compose ps
```

## GitHub Secrets Required

Add these in: **GitHub Repo → Settings → Secrets → Actions**

```
EC2_HOST              = YOUR_EC2_PUBLIC_IP
EC2_USERNAME          = ubuntu
EC2_SSH_KEY           = (content of your .pem file)
DATABASE_URL          = postgresql://...
JWT_SECRET            = your-jwt-secret
JWT_REFRESH_SECRET    = your-refresh-secret
SUPABASE_URL          = https://xxx.supabase.co
SUPABASE_KEY          = your-supabase-key
```

## Deploy

```bash
git add .
git commit -m "Deploy to production"
git push origin developer  # or main
```

## Verify Deployment

- Frontend: http://YOUR_EC2_IP
- Backend: http://YOUR_EC2_IP:3000
- Health: http://YOUR_EC2_IP:3000/health

## Common Commands

```bash
# SSH to server
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Update code manually
git pull && docker-compose up -d --build

# Check status
docker-compose ps

# Clean up
docker system prune -a
```

## Troubleshooting

```bash
# If deployment fails, check:
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart everything
docker-compose down && docker-compose up -d

# Check GitHub Actions
# Go to: https://github.com/YOUR_USERNAME/spms/actions
```
