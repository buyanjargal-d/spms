#!/bin/bash

# Quick Deployment Fix Script
# This script fixes the authentication issue and sets up deployment
# Usage: ./quick-deploy-fix.sh

set -e

SERVER_IP="34.197.247.53"
PEM_FILE="$HOME/Downloads/spms-backend.pem"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SPMS Quick Deployment Fix${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    echo -e "${YELLOW}Please update PEM_FILE path in this script${NC}"
    exit 1
fi

chmod 400 "$PEM_FILE"

# Detect user
echo -e "${YELLOW}Step 1: Detecting EC2 user...${NC}"
if ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@"$SERVER_IP" "echo 'ubuntu'" 2>/dev/null | grep -q "ubuntu"; then
    EC2_USER="ubuntu"
elif ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ec2-user@"$SERVER_IP" "echo 'ec2-user'" 2>/dev/null | grep -q "ec2-user"; then
    EC2_USER="ec2-user"
else
    echo -e "${RED}✗ Could not connect to server${NC}"
    echo -e "${YELLOW}Make sure:${NC}"
    echo -e "  1. Server is running"
    echo -e "  2. Security group allows SSH from your IP"
    echo -e "  3. PEM file is correct"
    exit 1
fi
echo -e "${GREEN}✓ Connected as $EC2_USER${NC}"

# Generate SSH key
echo -e "\n${YELLOW}Step 2: Setting up SSH deploy key...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$SERVER_IP" 'bash -s' << 'ENDSSH'
# Check if SSH key exists
if [ ! -f ~/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 -C "spms-deploy-key" -f ~/.ssh/id_ed25519 -N ""
fi

# Configure SSH for GitHub
mkdir -p ~/.ssh
cat > ~/.ssh/config << 'EOF'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no
EOF
chmod 600 ~/.ssh/config
ENDSSH
echo -e "${GREEN}✓ SSH key configured${NC}"

# Get the public key
echo -e "\n${YELLOW}Step 3: Retrieving public key...${NC}"
PUBLIC_KEY=$(ssh -i "$PEM_FILE" "$EC2_USER@$SERVER_IP" "cat ~/.ssh/id_ed25519.pub")
echo -e "${GREEN}✓ Public key retrieved${NC}"

# Display instructions
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}ACTION REQUIRED!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e ""
echo -e "${YELLOW}Please add this Deploy Key to GitHub:${NC}"
echo -e ""
echo -e "${GREEN}$PUBLIC_KEY${NC}"
echo -e ""
echo -e "${YELLOW}Steps:${NC}"
echo -e "1. Open: ${BLUE}https://github.com/buyanjargal-d/spms/settings/keys${NC}"
echo -e "2. Click ${GREEN}'Add deploy key'${NC}"
echo -e "3. Title: ${GREEN}SPMS EC2 Production Server${NC}"
echo -e "4. Paste the key above"
echo -e "5. ${RED}✓ Check 'Allow write access'${NC}"
echo -e "6. Click ${GREEN}'Add key'${NC}"
echo -e ""
echo -e "${BLUE}========================================${NC}"
echo -e ""

# Wait for user confirmation
read -p "Press ENTER after you've added the deploy key to GitHub..."

# Test connection
echo -e "\n${YELLOW}Step 4: Testing GitHub connection...${NC}"
if ssh -i "$PEM_FILE" "$EC2_USER@$SERVER_IP" "ssh -T git@github.com 2>&1" | grep -q "successfully authenticated"; then
    echo -e "${GREEN}✓ GitHub authentication successful!${NC}"
else
    echo -e "${RED}✗ GitHub authentication failed${NC}"
    echo -e "${YELLOW}Please make sure:${NC}"
    echo -e "  1. Deploy key is added to GitHub"
    echo -e "  2. 'Allow write access' is checked"
    echo -e "  3. Wait a minute and try again"
    echo -e ""
    read -p "Do you want to retry the test? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if ssh -i "$PEM_FILE" "$EC2_USER@$SERVER_IP" "ssh -T git@github.com 2>&1" | grep -q "successfully authenticated"; then
            echo -e "${GREEN}✓ GitHub authentication successful!${NC}"
        else
            echo -e "${RED}✗ Still failing. Please check the deploy key settings.${NC}"
            exit 1
        fi
    else
        exit 1
    fi
fi

# Clone or update repository
echo -e "\n${YELLOW}Step 5: Setting up repository...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$SERVER_IP" 'bash -s' << 'ENDSSH'
set -e

if [ -d ~/spms/.git ]; then
    echo "Repository exists, updating..."
    cd ~/spms
    git fetch origin
    git checkout developer
    git pull origin developer
else
    echo "Cloning repository..."
    rm -rf ~/spms
    git clone git@github.com:buyanjargal-d/spms.git ~/spms
    cd ~/spms
    git checkout developer
fi

echo "✓ Repository ready"
ENDSSH
echo -e "${GREEN}✓ Repository setup complete${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e ""
echo -e "1. Update GitHub secrets (if not already done):"
echo -e "   ${GREEN}./scripts/add-github-secrets.sh${NC}"
echo -e ""
echo -e "2. Commit and push changes:"
echo -e "   ${GREEN}git add .${NC}"
echo -e "   ${GREEN}git commit -m \"fix: configure deployment with SSH authentication\"${NC}"
echo -e "   ${GREEN}git push origin developer${NC}"
echo -e ""
echo -e "3. Or manually deploy now:"
echo -e "   ${GREEN}ssh -i $PEM_FILE $EC2_USER@$SERVER_IP 'cd ~/spms && docker compose up -d --build'${NC}"
echo -e ""
echo -e "${BLUE}Application URLs:${NC}"
echo -e "  Frontend: ${GREEN}http://$SERVER_IP${NC}"
echo -e "  Backend: ${GREEN}http://$SERVER_IP:3000${NC}"
echo -e "  Health: ${GREEN}http://$SERVER_IP:3000/health${NC}"
echo -e ""
