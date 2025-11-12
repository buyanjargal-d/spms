#!/bin/bash

# Check deployment status on AWS EC2
# Usage: ./check-deployment.sh

# Configuration
EC2_HOST="34.197.247.53"
EC2_USER="ec2-user"  # Change to "ubuntu" if using Ubuntu
PEM_FILE="$HOME/Downloads/spms-backend.pem"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SPMS Backend Deployment Status${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

chmod 400 "$PEM_FILE"

# Test connection
echo -e "\n${YELLOW}1. Testing connection...${NC}"
if ssh -i "$PEM_FILE" -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" "echo 'OK'" 2>/dev/null; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
    exit 1
fi

# Check Docker
echo -e "\n${YELLOW}2. Checking Docker...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    if command -v docker &> /dev/null; then
        echo "✓ Docker installed: $(docker --version)"
    else
        echo "✗ Docker not installed"
    fi

    if command -v docker-compose &> /dev/null; then
        echo "✓ Docker Compose installed: $(docker-compose --version)"
    else
        echo "✗ Docker Compose not installed"
    fi
ENDSSH

# Check containers
echo -e "\n${YELLOW}3. Checking containers...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    if [ -f ~/spms-backend/docker-compose.yml ]; then
        cd ~/spms-backend
        echo "Container status:"
        sudo docker-compose ps
    else
        echo "✗ docker-compose.yml not found"
    fi
ENDSSH

# Check logs
echo -e "\n${YELLOW}4. Recent logs (last 20 lines)...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    if [ -f ~/spms-backend/docker-compose.yml ]; then
        cd ~/spms-backend
        sudo docker-compose logs --tail=20
    fi
ENDSSH

# Health check
echo -e "\n${YELLOW}5. Health check...${NC}"
if curl -f -s "http://$EC2_HOST:3000/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
    echo -e "Response: $(curl -s http://$EC2_HOST:3000/health)"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    echo -e "Trying localhost from EC2..."
    ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" "curl -f http://localhost:3000/health 2>/dev/null" || echo "Also failed on localhost"
fi

# System resources
echo -e "\n${YELLOW}6. System resources...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    echo "Disk usage:"
    df -h / | tail -1
    echo ""
    echo "Memory usage:"
    free -h | grep Mem
    echo ""
    echo "Docker disk usage:"
    sudo docker system df
ENDSSH

# Port check
echo -e "\n${YELLOW}7. Port status...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    echo "Listening ports:"
    sudo netstat -tulpn | grep -E ':(3000|6379)' || echo "No services on ports 3000, 6379"
ENDSSH

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Quick Actions${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "View live logs: ${GREEN}ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'sudo docker-compose -f ~/spms-backend/docker-compose.yml logs -f'${NC}"
echo -e "Restart services: ${GREEN}ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'sudo docker-compose -f ~/spms-backend/docker-compose.yml restart'${NC}"
echo -e "SSH to server: ${GREEN}ssh -i $PEM_FILE $EC2_USER@$EC2_HOST${NC}"
echo -e "${BLUE}========================================${NC}"
