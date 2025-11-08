#!/bin/bash

# Manual deployment script for SPMS backend to AWS EC2
# Usage: ./deploy-manual.sh

set -e

# Configuration
EC2_HOST="3.94.130.22"
EC2_USER="ubuntu"  # Change to "ubuntu" if using Ubuntu
PEM_FILE="$HOME/Downloads/spms-backend.pem"
REMOTE_DIR="~/spms-backend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SPMS Backend Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

# Set correct permissions
chmod 400 "$PEM_FILE"

# Test connection
echo -e "\n${YELLOW}Testing SSH connection...${NC}"
if ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH connection successful${NC}"
else
    echo -e "${RED}✗ SSH connection failed${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "  1. EC2 instance is running"
    echo -e "  2. Security group allows SSH (port 22)"
    echo -e "  3. PEM file is correct"
    echo -e "  4. EC2_USER is correct (ec2-user for Amazon Linux, ubuntu for Ubuntu)"
    exit 1
fi

# Create remote directory
echo -e "\n${YELLOW}Creating remote directory...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" "mkdir -p $REMOTE_DIR/backend/logs"

# Copy backend files
echo -e "\n${YELLOW}Copying backend files...${NC}"
rsync -avz -e "ssh -i $PEM_FILE" \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.env' \
    --exclude '.git' \
    --progress \
    ./backend/ "$EC2_USER@$EC2_HOST:$REMOTE_DIR/backend/"

echo -e "${GREEN}✓ Backend files copied${NC}"

# Copy docker-compose.yml
echo -e "\n${YELLOW}Copying docker-compose.yml...${NC}"
scp -i "$PEM_FILE" docker-compose.yml "$EC2_USER@$EC2_HOST:$REMOTE_DIR/"
echo -e "${GREEN}✓ docker-compose.yml copied${NC}"

# Create .env file
echo -e "\n${YELLOW}Creating .env file...${NC}"
echo -e "${YELLOW}Please enter the following environment variables:${NC}"

read -p "DATABASE_URL: " DATABASE_URL
read -p "JWT_SECRET: " JWT_SECRET
read -p "JWT_REFRESH_SECRET: " JWT_REFRESH_SECRET
read -p "SUPABASE_URL: " SUPABASE_URL
read -p "SUPABASE_KEY: " SUPABASE_KEY

ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" "cat > $REMOTE_DIR/backend/.env" << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
SUPABASE_URL=$SUPABASE_URL
SUPABASE_KEY=$SUPABASE_KEY
EOF

echo -e "${GREEN}✓ .env file created${NC}"

# Deploy with Docker Compose
echo -e "\n${YELLOW}Deploying with Docker Compose...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd ~/spms-backend

    # Stop existing containers
    echo "Stopping existing containers..."
    sudo docker-compose down || true

    # Remove old images
    echo "Removing old images..."
    sudo docker image prune -af || true

    # Build and start
    echo "Building and starting containers..."
    sudo docker-compose up -d --build

    # Wait for containers to start
    echo "Waiting for containers to start..."
    sleep 10

    # Show status
    echo "Container status:"
    sudo docker-compose ps

    # Show logs
    echo "Recent logs:"
    sudo docker-compose logs --tail=50
ENDSSH

echo -e "${GREEN}✓ Deployment complete${NC}"

# Health check
echo -e "\n${YELLOW}Running health check...${NC}"
sleep 5

if ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" "curl -f http://localhost:3000/health 2>/dev/null"; then
    echo -e "\n${GREEN}✓ Health check passed${NC}"
else
    echo -e "\n${YELLOW}⚠ Health check failed or endpoint not ready yet${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Backend URL: ${GREEN}http://$EC2_HOST:3000${NC}"
echo -e "Health check: ${GREEN}http://$EC2_HOST:3000/health${NC}"
echo -e "\n${YELLOW}Useful commands:${NC}"
echo -e "View logs: ${GREEN}ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'sudo docker-compose -f ~/spms-backend/docker-compose.yml logs -f'${NC}"
echo -e "Restart: ${GREEN}ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'sudo docker-compose -f ~/spms-backend/docker-compose.yml restart'${NC}"
echo -e "Stop: ${GREEN}ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'sudo docker-compose -f ~/spms-backend/docker-compose.yml down'${NC}"
echo -e "${GREEN}========================================${NC}"
