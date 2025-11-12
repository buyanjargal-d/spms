#!/bin/bash

# Setup Deploy Key on EC2 Server
# This script sets up SSH deploy keys for GitHub repository access
# Usage: ./setup-deploy-key.sh <SERVER_IP> <PEM_FILE_PATH>

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 <SERVER_IP> <PEM_FILE_PATH>${NC}"
    echo -e "${YELLOW}Example: $0 34.197.247.53 ~/Downloads/spms-backend.pem${NC}"
    exit 1
fi

SERVER_IP="$1"
PEM_FILE="$2"

# Expand tilde in PEM file path
PEM_FILE="${PEM_FILE/#\~/$HOME}"

# Validate PEM file
if [ ! -f "$PEM_FILE" ]; then
    echo -e "${RED}Error: PEM file not found at $PEM_FILE${NC}"
    exit 1
fi

chmod 400 "$PEM_FILE"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}GitHub Deploy Key Setup${NC}"
echo -e "${BLUE}========================================${NC}"

# Detect EC2 user
echo -e "\n${YELLOW}Detecting EC2 user...${NC}"
if ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@"$SERVER_IP" "echo 'ubuntu'" 2>/dev/null | grep -q "ubuntu"; then
    EC2_USER="ubuntu"
    echo -e "${GREEN}✓ Detected user: ubuntu${NC}"
elif ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ec2-user@"$SERVER_IP" "echo 'ec2-user'" 2>/dev/null | grep -q "ec2-user"; then
    EC2_USER="ec2-user"
    echo -e "${GREEN}✓ Detected user: ec2-user${NC}"
else
    echo -e "${RED}✗ Could not connect to server${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 1: Generating SSH key on server...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$SERVER_IP" 'bash -s' << 'ENDSSH'
set -e

# Check if SSH key already exists
if [ -f ~/.ssh/id_ed25519 ]; then
    echo "SSH key already exists. Using existing key."
else
    # Generate new SSH key
    ssh-keygen -t ed25519 -C "spms-deploy-key" -f ~/.ssh/id_ed25519 -N ""
    echo "✓ SSH key generated"
fi

# Ensure SSH agent has the key
eval "$(ssh-agent -s)" > /dev/null 2>&1
ssh-add ~/.ssh/id_ed25519 2>/dev/null || true

# Configure SSH to use this key for GitHub
mkdir -p ~/.ssh
cat > ~/.ssh/config << 'EOF'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config

echo ""
echo "========================================="
echo "Public SSH Key (Add this to GitHub):"
echo "========================================="
cat ~/.ssh/id_ed25519.pub
echo "========================================="
ENDSSH

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Next Steps:${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e ""
echo -e "${YELLOW}1. Copy the public key shown above${NC}"
echo -e ""
echo -e "${YELLOW}2. Add it as a Deploy Key in GitHub:${NC}"
echo -e "   a. Go to: ${GREEN}https://github.com/buyanjargal-d/spms/settings/keys${NC}"
echo -e "   b. Click ${GREEN}'Add deploy key'${NC}"
echo -e "   c. Title: ${GREEN}'SPMS EC2 Production Server'${NC}"
echo -e "   d. Paste the public key"
echo -e "   e. ${GREEN}Check 'Allow write access'${NC} if you need to push from server"
echo -e "   f. Click ${GREEN}'Add key'${NC}"
echo -e ""
echo -e "${YELLOW}3. Test the connection:${NC}"
echo -e "   ${GREEN}ssh -i $PEM_FILE $EC2_USER@$SERVER_IP 'ssh -T git@github.com'${NC}"
echo -e ""
echo -e "${YELLOW}4. Once the key is added, the deployment will work!${NC}"
echo -e ""
echo -e "${BLUE}========================================${NC}"

# Save the public key locally for reference
echo -e "\n${YELLOW}Saving public key to local file...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$SERVER_IP" "cat ~/.ssh/id_ed25519.pub" > /tmp/spms-deploy-key.pub
echo -e "${GREEN}✓ Public key saved to: /tmp/spms-deploy-key.pub${NC}"
echo -e ""
cat /tmp/spms-deploy-key.pub
