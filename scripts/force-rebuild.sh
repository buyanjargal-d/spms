#!/bin/bash

# Force Rebuild Backend on Server
# This ensures the latest code changes are deployed
# Usage: ./force-rebuild.sh <SERVER_IP> <PEM_FILE>

set -e

SERVER_IP="${1:-34.197.247.53}"
PEM_FILE="${2:-$HOME/Downloads/spms-backend.pem}"

# Expand tilde
PEM_FILE="${PEM_FILE/#\~/$HOME}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Force Rebuild Backend with SSL Fix${NC}"
echo -e "${BLUE}========================================${NC}"

# Validate PEM file
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

chmod 400 "$PEM_FILE"

# Detect user
echo -e "\n${YELLOW}Connecting to server...${NC}"
if ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@"$SERVER_IP" "echo 'ubuntu'" 2>/dev/null | grep -q "ubuntu"; then
    EC2_USER="ubuntu"
elif ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ec2-user@"$SERVER_IP" "echo 'ec2-user'" 2>/dev/null | grep -q "ec2-user"; then
    EC2_USER="ec2-user"
else
    echo -e "${RED}✗ Could not connect to server${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Connected as $EC2_USER${NC}"

echo -e "\n${YELLOW}Rebuilding backend with SSL fix...${NC}"

ssh -i "$PEM_FILE" "$EC2_USER@$SERVER_IP" 'bash -s' << 'ENDSSH'
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

# Find spms directory
if [ -d ~/spms ]; then
    cd ~/spms
else
    echo -e "${RED}Error: spms directory not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Pulling latest code...${NC}"
git fetch origin
git checkout developer
git pull origin developer
CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo -e "${GREEN}✓ Now on commit: $CURRENT_COMMIT${NC}"

echo -e "\n${YELLOW}Step 2: Stopping containers...${NC}"
docker compose down
echo -e "${GREEN}✓ Containers stopped${NC}"

echo -e "\n${YELLOW}Step 3: Removing backend image to force rebuild...${NC}"
docker rmi spms-backend:latest 2>/dev/null || true
docker rmi spms_backend:latest 2>/dev/null || true
echo -e "${GREEN}✓ Old image removed${NC}"

echo -e "\n${YELLOW}Step 4: Rebuilding backend without cache...${NC}"
export VITE_API_URL="/api/v1"
docker compose build --no-cache backend
echo -e "${GREEN}✓ Backend rebuilt${NC}"

echo -e "\n${YELLOW}Step 5: Starting all containers...${NC}"
docker compose up -d
echo -e "${GREEN}✓ Containers started${NC}"

echo -e "\n${YELLOW}Step 6: Waiting for services to start (30 seconds)...${NC}"
sleep 30

echo -e "\n${YELLOW}Step 7: Checking backend logs for SSL fix...${NC}"
echo -e "${BLUE}Looking for database connection...${NC}"
docker compose logs backend --tail=50 | grep -A 5 -B 5 "database" || echo "No database logs yet"

echo -e "\n${YELLOW}Step 8: Testing backend health...${NC}"
MAX_RETRIES=10
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
        HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
        echo -e "${GREEN}✓ Backend is healthy!${NC}"
        echo "Response: $HEALTH_RESPONSE"
        break
    else
        RETRY=$((RETRY+1))
        echo "Attempt $RETRY/$MAX_RETRIES - Backend not ready yet, waiting 3 seconds..."
        sleep 3
    fi
done

if [ $RETRY -eq $MAX_RETRIES ]; then
    echo -e "${RED}✗ Backend failed to start after $MAX_RETRIES attempts${NC}"
    echo -e "\n${YELLOW}Full backend logs:${NC}"
    docker compose logs backend --tail=100
    exit 1
fi

echo -e "\n${YELLOW}Step 9: Container status...${NC}"
docker compose ps

echo -e "\n${YELLOW}Step 10: Testing API endpoint...${NC}"
curl -s http://localhost/api/v1/health && echo "" || echo "API test failed"

ENDSSH

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Rebuild Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "${YELLOW}Testing from your machine...${NC}"

sleep 3

echo -n "Frontend: "
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://$SERVER_IP

echo -n "Backend: "
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://$SERVER_IP:3000/health

echo -n "API: "
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://$SERVER_IP/api/v1/health

echo -e ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e ""
echo -e "${YELLOW}Application URLs:${NC}"
echo -e "  Frontend: ${GREEN}http://$SERVER_IP${NC}"
echo -e "  Backend: ${GREEN}http://$SERVER_IP:3000${NC}"
echo -e "  Health: ${GREEN}http://$SERVER_IP/api/v1/health${NC}"
echo -e ""
echo -e "${YELLOW}If still having issues, check logs:${NC}"
echo -e "${GREEN}ssh -i $PEM_FILE $EC2_USER@$SERVER_IP 'cd ~/spms && docker compose logs backend -f'${NC}"
echo -e ""
