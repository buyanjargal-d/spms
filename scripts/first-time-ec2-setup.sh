#!/bin/bash

# First-time EC2 Setup Script
# Run this script ONCE on your EC2 instance before using GitHub Actions

set -e

echo "========================================="
echo "SPMS - First-Time EC2 Setup"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get the current user
CURRENT_USER=$(whoami)
echo -e "${GREEN}Current user: $CURRENT_USER${NC}"
echo ""

# Check if running on EC2
if [ "$CURRENT_USER" != "ubuntu" ] && [ "$CURRENT_USER" != "ec2-user" ]; then
    echo -e "${YELLOW}Warning: This script is designed for EC2 instances${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 1: Update system packages
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get upgrade -y
elif command -v yum &> /dev/null; then
    sudo yum update -y
fi
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Install Docker
echo -e "${YELLOW}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $CURRENT_USER
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi
echo ""

# Step 3: Install Docker Compose V2
echo -e "${YELLOW}Step 3: Installing Docker Compose Plugin...${NC}"
if ! docker compose version &> /dev/null; then
    # Install Docker Compose V2 as a plugin
    DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
    mkdir -p $DOCKER_CONFIG/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
    chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi
echo ""

# Step 4: Install Git
echo -e "${YELLOW}Step 4: Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y git
    elif command -v yum &> /dev/null; then
        sudo yum install -y git
    fi
    echo -e "${GREEN}✓ Git installed${NC}"
else
    echo -e "${GREEN}✓ Git already installed${NC}"
fi
echo ""

# Step 5: Clone repository
echo -e "${YELLOW}Step 5: Cloning SPMS repository...${NC}"
REPO_DIR="/home/$CURRENT_USER/spms"

if [ -d "$REPO_DIR" ]; then
    echo -e "${YELLOW}Repository directory already exists. Removing...${NC}"
    rm -rf "$REPO_DIR"
fi

mkdir -p "$REPO_DIR"
cd "$REPO_DIR"

# Check if this is a public repo or if we need authentication
echo "Cloning repository..."
if git clone -b developer https://github.com/buyanjargal-d/spms.git . 2>/dev/null; then
    echo -e "${GREEN}✓ Repository cloned successfully (developer branch)${NC}"
else
    echo -e "${RED}✗ Failed to clone repository${NC}"
    echo ""
    echo -e "${YELLOW}The repository might be private. Options:${NC}"
    echo "1. Make the repository public on GitHub"
    echo "2. Or, set up SSH keys:"
    echo ""
    echo "   # Generate SSH key on EC2:"
    echo "   ssh-keygen -t ed25519 -C 'your_email@example.com'"
    echo ""
    echo "   # Display the public key:"
    echo "   cat ~/.ssh/id_ed25519.pub"
    echo ""
    echo "   # Add this key to GitHub:"
    echo "   https://github.com/settings/ssh/new"
    echo ""
    echo "   # Then clone with SSH:"
    echo "   git clone -b developer git@github.com:buyanjargal-d/spms.git $REPO_DIR"
    echo ""
    exit 1
fi
echo ""

# Step 6: Create backend .env file
echo -e "${YELLOW}Step 6: Creating backend .env file...${NC}"
cat > backend/.env << 'EOF'
NODE_ENV=production
PORT=3000
# Add your environment variables here or they will be set by GitHub Actions
EOF
echo -e "${GREEN}✓ Backend .env created (will be updated by GitHub Actions)${NC}"
echo ""

# Step 7: Configure firewall
echo -e "${YELLOW}Step 7: Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 3000/tcp  # Backend
    sudo ufw --force enable || true
    echo -e "${GREEN}✓ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠ UFW not found. Please configure firewall manually:${NC}"
    echo "  - Allow port 22 (SSH)"
    echo "  - Allow port 80 (HTTP)"
    echo "  - Allow port 443 (HTTPS)"
    echo "  - Allow port 3000 (Backend)"
fi
echo ""

# Step 8: Display versions
echo ""
echo "========================================="
echo -e "${GREEN}Installation Complete!${NC}"
echo "========================================="
echo ""
echo "Installed versions:"
docker --version
docker compose version
git --version
echo ""

# Step 9: Important next steps
echo "========================================="
echo -e "${YELLOW}IMPORTANT NEXT STEPS:${NC}"
echo "========================================="
echo ""
echo "1. ${YELLOW}LOGOUT AND LOGIN AGAIN${NC} for Docker permissions:"
echo "   exit"
echo "   ssh -i your-key.pem $CURRENT_USER@3.94.130.22"
echo ""
echo "2. Verify Docker works without sudo:"
echo "   docker ps"
echo ""
echo "3. Test manual deployment:"
echo "   cd ~/spms"
echo "   docker compose up -d --build"
echo ""
echo "4. If manual deployment works, you can now use GitHub Actions!"
echo "   Just push to 'developer' or 'main' branch"
echo ""
echo "5. View logs:"
echo "   docker compose logs -f"
echo ""
echo "========================================="
echo -e "${GREEN}Repository location: $REPO_DIR${NC}"
echo "========================================="
echo ""
