#!/bin/bash

# Fix 502 Bad Gateway Error
# This script restarts containers and ensures proper network connectivity
# Usage: ./fix-502-error.sh <SERVER_IP> <PEM_FILE>

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
echo -e "${BLUE}Fixing 502 Bad Gateway Error${NC}"
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

echo -e "\n${YELLOW}Applying fixes on server...${NC}"

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
elif [ -d /home/*/spms ]; then
    cd /home/*/spms
else
    echo -e "${RED}Error: spms directory not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Stopping all containers...${NC}"
docker compose down
echo -e "${GREEN}✓ Containers stopped${NC}"

echo -e "\n${YELLOW}Step 2: Removing any orphaned containers...${NC}"
docker compose down --remove-orphans
echo -e "${GREEN}✓ Orphaned containers removed${NC}"

echo -e "\n${YELLOW}Step 3: Cleaning up Docker networks...${NC}"
docker network prune -f
echo -e "${GREEN}✓ Networks cleaned${NC}"

echo -e "\n${YELLOW}Step 4: Rebuilding and starting containers...${NC}"
# Set the API URL for frontend build
export VITE_API_URL="/api/v1"
docker compose up -d --build --force-recreate

echo -e "\n${YELLOW}Step 5: Waiting for containers to start (30 seconds)...${NC}"
sleep 30

echo -e "\n${YELLOW}Step 6: Checking container status...${NC}"
docker compose ps

echo -e "\n${YELLOW}Step 7: Testing backend health...${NC}"
MAX_RETRIES=10
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy!${NC}"
        echo "Response: $(curl -s http://localhost:3000/health)"
        break
    else
        RETRY=$((RETRY+1))
        echo "Attempt $RETRY/$MAX_RETRIES - Backend not ready yet, waiting..."
        sleep 3
    fi
done

if [ $RETRY -eq $MAX_RETRIES ]; then
    echo -e "${RED}✗ Backend failed to start properly${NC}"
    echo -e "\n${YELLOW}Backend logs:${NC}"
    docker compose logs backend --tail=50
    exit 1
fi

echo -e "\n${YELLOW}Step 8: Testing nginx proxy...${NC}"
sleep 5
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/health 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Nginx proxy is working! (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}✗ Nginx proxy still not working (HTTP $HTTP_CODE)${NC}"
    echo -e "\n${YELLOW}Nginx logs:${NC}"
    docker compose logs frontend --tail=30
    echo -e "\n${YELLOW}Testing container connectivity:${NC}"
    docker exec spms-frontend sh -c "ping -c 2 backend || ping -c 2 spms-backend" || echo "Cannot ping backend"
fi

echo -e "\n${YELLOW}Step 9: Testing from outside...${NC}"
ENDSSH

echo -e "\n${YELLOW}Step 10: Testing from your machine...${NC}"
sleep 5

echo -n "Testing frontend: "
FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP)
if [ "$FRONTEND_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible (HTTP $FRONTEND_CODE)${NC}"
else
    echo -e "${RED}✗ Frontend not accessible (HTTP $FRONTEND_CODE)${NC}"
fi

echo -n "Testing backend health: "
BACKEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:3000/health)
if [ "$BACKEND_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Backend is accessible (HTTP $BACKEND_CODE)${NC}"
else
    echo -e "${RED}✗ Backend not accessible (HTTP $BACKEND_CODE)${NC}"
fi

echo -n "Testing API via nginx: "
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP/api/v1/health)
if [ "$API_CODE" = "200" ]; then
    echo -e "${GREEN}✓ API via nginx is working! (HTTP $API_CODE)${NC}"
else
    echo -e "${RED}✗ API via nginx failed (HTTP $API_CODE)${NC}"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Fix Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e ""
echo -e "${YELLOW}Application URLs:${NC}"
echo -e "  Frontend: ${GREEN}http://$SERVER_IP${NC}"
echo -e "  Backend: ${GREEN}http://$SERVER_IP:3000${NC}"
echo -e "  API Health: ${GREEN}http://$SERVER_IP/api/v1/health${NC}"
echo -e ""

if [ "$API_CODE" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS! The 502 error should be fixed now.${NC}"
    echo -e "${YELLOW}Try logging in again at: ${GREEN}http://$SERVER_IP${NC}"
else
    echo -e "${RED}⚠️  Issue persists. Running diagnostics...${NC}"
    echo -e ""
    echo -e "${YELLOW}View logs with:${NC}"
    echo -e "${GREEN}ssh -i $PEM_FILE $EC2_USER@$SERVER_IP 'cd ~/spms && docker compose logs -f'${NC}"
    echo -e ""
    echo -e "${YELLOW}Or run full diagnostics:${NC}"
    echo -e "${GREEN}./scripts/diagnose-502.sh${NC}"
fi
echo -e ""
