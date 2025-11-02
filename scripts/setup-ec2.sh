#!/bin/bash

# Setup script for AWS EC2 instance
# This script prepares the EC2 instance for Docker deployment

set -e

echo "🚀 Setting up EC2 instance for SPMS backend deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}Cannot detect OS${NC}"
    exit 1
fi

echo -e "${GREEN}Detected OS: $OS${NC}"

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
if [ "$OS" = "amzn" ] || [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    sudo yum update -y
elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt-get update
    sudo apt-get upgrade -y
fi

# Install Docker
echo -e "${YELLOW}Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    if [ "$OS" = "amzn" ] || [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        sudo yum install -y docker
        sudo service docker start
        sudo systemctl enable docker
    elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt-get install -y docker.io
        sudo systemctl start docker
        sudo systemctl enable docker
    fi

    # Add current user to docker group
    sudo usermod -a -G docker $USER
    echo -e "${GREEN}Docker installed successfully${NC}"
    echo -e "${YELLOW}Please log out and log back in for docker group changes to take effect${NC}"
else
    echo -e "${GREEN}Docker is already installed${NC}"
fi

# Install Docker Compose
echo -e "${YELLOW}Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully${NC}"
else
    echo -e "${GREEN}Docker Compose is already installed${NC}"
fi

# Create deployment directory
echo -e "${YELLOW}Creating deployment directories...${NC}"
mkdir -p ~/spms-backend/backend/logs
echo -e "${GREEN}Directories created${NC}"

# Install useful tools
echo -e "${YELLOW}Installing additional tools...${NC}"
if [ "$OS" = "amzn" ] || [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    sudo yum install -y git curl wget htop
elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt-get install -y git curl wget htop
fi

# Display versions
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Installation Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Docker version: $(docker --version)"
echo -e "Docker Compose version: $(docker-compose --version)"
echo -e "Git version: $(git --version)"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${GREEN}✅ EC2 instance setup completed!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Log out and log back in for docker group to take effect"
echo -e "2. Configure GitHub Secrets in your repository"
echo -e "3. Push code to trigger deployment or manually run GitHub Action"
echo -e "\n${YELLOW}Useful commands:${NC}"
echo -e "- Check docker: ${GREEN}docker ps${NC}"
echo -e "- View logs: ${GREEN}sudo docker-compose -f ~/spms-backend/docker-compose.yml logs -f${NC}"
echo -e "- Restart: ${GREEN}sudo docker-compose -f ~/spms-backend/docker-compose.yml restart${NC}"
