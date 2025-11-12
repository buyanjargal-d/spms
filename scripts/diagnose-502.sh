#!/bin/bash

# Diagnose 502 Bad Gateway Error
# Usage: ./diagnose-502.sh <SERVER_IP> <PEM_FILE>

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
echo -e "${BLUE}Diagnosing 502 Bad Gateway Error${NC}"
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

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Running Diagnostics on Server${NC}"
echo -e "${BLUE}========================================${NC}"

ssh -i "$PEM_FILE" "$EC2_USER@$SERVER_IP" 'bash -s' << 'ENDSSH'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

echo -e "\n${YELLOW}1. Checking Docker containers status...${NC}"
cd ~/spms 2>/dev/null || cd /home/*/spms 2>/dev/null || echo "spms directory not found"
docker compose ps

echo -e "\n${YELLOW}2. Checking if backend is responding...${NC}"
echo -n "Backend health check (localhost:3000): "
if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is UP${NC}"
    echo "Response: $(curl -s http://localhost:3000/health)"
else
    echo -e "${RED}✗ Backend is DOWN or not responding${NC}"
fi

echo -e "\n${YELLOW}3. Testing backend API endpoint directly...${NC}"
echo -n "Testing /api/v1/auth/login endpoint: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"danId":"test","role":"admin"}')
echo "HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
else
    echo -e "${RED}✗ Backend API is not responding properly${NC}"
fi

echo -e "\n${YELLOW}4. Checking nginx configuration...${NC}"
if docker exec spms-frontend test -f /etc/nginx/conf.d/default.conf 2>/dev/null; then
    echo "Nginx config exists. Content:"
    docker exec spms-frontend cat /etc/nginx/conf.d/default.conf
else
    echo -e "${RED}✗ Nginx config not found${NC}"
fi

echo -e "\n${YELLOW}5. Testing nginx proxy to backend...${NC}"
echo -n "Testing nginx -> backend proxy: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/health 2>/dev/null || echo "000")
echo "HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Nginx proxy is working${NC}"
else
    echo -e "${RED}✗ Nginx proxy is NOT working (502)${NC}"
fi

echo -e "\n${YELLOW}6. Checking backend container logs (last 30 lines)...${NC}"
docker logs spms-backend --tail=30 2>&1

echo -e "\n${YELLOW}7. Checking frontend/nginx logs (last 20 lines)...${NC}"
docker logs spms-frontend --tail=20 2>&1

echo -e "\n${YELLOW}8. Checking network connectivity between containers...${NC}"
echo "Checking if frontend can reach backend:"
docker exec spms-frontend sh -c "wget -q -O- http://backend:3000/health 2>&1 || wget -q -O- http://spms-backend:3000/health 2>&1 || echo 'Cannot reach backend'"

echo -e "\n${YELLOW}9. Checking Docker network...${NC}"
docker network ls | grep spms
echo ""
docker network inspect spms_spms-network 2>/dev/null | grep -A 5 "Containers" || docker network inspect spms-network 2>/dev/null | grep -A 5 "Containers" || echo "Network not found"

echo -e "\n${YELLOW}10. Checking environment variables...${NC}"
echo "Backend environment:"
docker exec spms-backend env | grep -E "NODE_ENV|PORT|DATABASE_URL" | sed 's/\(DATABASE_URL=.*\)/DATABASE_URL=<hidden>/'

echo -e "\n${YELLOW}11. Checking ports...${NC}"
echo "Listening ports:"
netstat -tulpn 2>/dev/null | grep -E ":(80|3000|5432|6379)" || ss -tulpn | grep -E ":(80|3000|5432|6379)"

ENDSSH

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Diagnosis Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e ""
echo -e "${YELLOW}Common causes of 502 Bad Gateway:${NC}"
echo -e "1. ${RED}Backend container is not running${NC}"
echo -e "   Fix: ssh to server and run 'docker compose up -d --build'"
echo -e ""
echo -e "2. ${RED}Nginx can't reach backend (wrong hostname)${NC}"
echo -e "   Fix: Check nginx config uses 'backend:3000' not 'localhost:3000'"
echo -e ""
echo -e "3. ${RED}Backend is running but crashed/unhealthy${NC}"
echo -e "   Fix: Check backend logs for errors"
echo -e ""
echo -e "4. ${RED}Network issue between containers${NC}"
echo -e "   Fix: Recreate containers 'docker compose down && docker compose up -d'"
echo -e ""
echo -e "5. ${RED}Database connection failed${NC}"
echo -e "   Fix: Check DATABASE_URL and database accessibility"
echo -e ""
echo -e "${YELLOW}Quick fixes to try:${NC}"
echo -e "${GREEN}ssh -i $PEM_FILE $EC2_USER@$SERVER_IP${NC}"
echo -e "${GREEN}cd ~/spms${NC}"
echo -e "${GREEN}docker compose down${NC}"
echo -e "${GREEN}docker compose up -d --build${NC}"
echo -e "${GREEN}docker compose logs -f${NC}"
echo -e ""
