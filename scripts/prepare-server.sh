#!/bin/bash

# Server Preparation Script for SPMS
# This script prepares a fresh Ubuntu/Amazon Linux server for SPMS deployment
# Usage: ./prepare-server.sh <SERVER_IP> <PEM_FILE_PATH>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

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

# Set correct permissions for PEM file
chmod 400 "$PEM_FILE"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SPMS Server Preparation Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Server IP: ${GREEN}$SERVER_IP${NC}"
echo -e "PEM File: ${GREEN}$PEM_FILE${NC}"
echo -e "${BLUE}========================================${NC}"

# Detect EC2 user (try ubuntu first, then ec2-user)
echo -e "\n${YELLOW}Detecting EC2 user...${NC}"
if ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@"$SERVER_IP" "echo 'ubuntu'" 2>/dev/null | grep -q "ubuntu"; then
    EC2_USER="ubuntu"
    echo -e "${GREEN}✓ Detected user: ubuntu${NC}"
elif ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ec2-user@"$SERVER_IP" "echo 'ec2-user'" 2>/dev/null | grep -q "ec2-user"; then
    EC2_USER="ec2-user"
    echo -e "${GREEN}✓ Detected user: ec2-user${NC}"
else
    echo -e "${RED}✗ Could not connect to server${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "  1. Server is running"
    echo -e "  2. Security group allows SSH (port 22) from your IP"
    echo -e "  3. PEM file is correct"
    exit 1
fi

# Main preparation script
echo -e "\n${YELLOW}Starting server preparation...${NC}"
ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$SERVER_IP" 'bash -s' << 'ENDSSH'
set -e

# Colors for remote output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 1: System Update${NC}"
echo -e "${BLUE}========================================${NC}"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}Cannot detect OS${NC}"
    exit 1
fi

echo -e "Detected OS: ${GREEN}$OS${NC}"

# Update system packages
echo -e "\n${YELLOW}Updating system packages...${NC}"
if [ "$OS" = "ubuntu" ]; then
    sudo apt-get update -y
    sudo apt-get upgrade -y
elif [ "$OS" = "amzn" ]; then
    sudo yum update -y
fi
echo -e "${GREEN}✓ System updated${NC}"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Step 2: Install Docker${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Docker is already installed
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker already installed: $(docker --version)${NC}"
else
    echo -e "${YELLOW}Installing Docker...${NC}"
    if [ "$OS" = "ubuntu" ]; then
        # Ubuntu Docker installation
        sudo apt-get install -y \
            ca-certificates \
            curl \
            gnupg \
            lsb-release

        # Add Docker's official GPG key
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

        # Set up the repository
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Install Docker Engine
        sudo apt-get update -y
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    elif [ "$OS" = "amzn" ]; then
        # Amazon Linux Docker installation
        sudo yum install -y docker
        sudo service docker start
        sudo systemctl enable docker
    fi

    echo -e "${GREEN}✓ Docker installed${NC}"
fi

# Start Docker service
echo -e "\n${YELLOW}Starting Docker service...${NC}"
if [ "$OS" = "ubuntu" ]; then
    sudo systemctl start docker
    sudo systemctl enable docker
elif [ "$OS" = "amzn" ]; then
    sudo service docker start
    sudo chkconfig docker on
fi
echo -e "${GREEN}✓ Docker service started${NC}"

# Add current user to docker group
echo -e "\n${YELLOW}Adding current user to docker group...${NC}"
sudo usermod -aG docker $USER
echo -e "${GREEN}✓ User added to docker group${NC}"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Step 3: Install Docker Compose${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if docker compose (v2) is available
if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose already installed: $(docker compose version)${NC}"
elif command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose (v1) already installed: $(docker-compose --version)${NC}"
else
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    if [ "$OS" = "ubuntu" ]; then
        # Already installed as docker-compose-plugin
        echo -e "${GREEN}✓ Docker Compose installed as plugin${NC}"
    elif [ "$OS" = "amzn" ]; then
        # Install Docker Compose v2 for Amazon Linux
        sudo mkdir -p /usr/local/lib/docker/cli-plugins
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
            -o /usr/local/lib/docker/cli-plugins/docker-compose
        sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
        echo -e "${GREEN}✓ Docker Compose installed${NC}"
    fi
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Step 4: Install Git${NC}"
echo -e "${BLUE}========================================${NC}"

if command -v git &> /dev/null; then
    echo -e "${GREEN}✓ Git already installed: $(git --version)${NC}"
else
    echo -e "${YELLOW}Installing Git...${NC}"
    if [ "$OS" = "ubuntu" ]; then
        sudo apt-get install -y git
    elif [ "$OS" = "amzn" ]; then
        sudo yum install -y git
    fi
    echo -e "${GREEN}✓ Git installed${NC}"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Step 5: Install Additional Tools${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "${YELLOW}Installing curl, wget, htop...${NC}"
if [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y curl wget htop unzip
elif [ "$OS" = "amzn" ]; then
    sudo yum install -y curl wget htop unzip
fi
echo -e "${GREEN}✓ Additional tools installed${NC}"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Step 6: Configure Firewall${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "${YELLOW}Checking firewall status...${NC}"
if command -v ufw &> /dev/null; then
    echo -e "${YELLOW}Configuring UFW firewall...${NC}"
    sudo ufw --force enable
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP (Frontend)
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 3000/tcp  # Backend API
    sudo ufw allow 5432/tcp  # PostgreSQL (only if external access needed)
    sudo ufw allow 6379/tcp  # Redis (only if external access needed)
    sudo ufw status
    echo -e "${GREEN}✓ UFW firewall configured${NC}"
else
    echo -e "${YELLOW}⚠ UFW not available. Configure security groups in AWS Console:${NC}"
    echo -e "  - Port 22 (SSH)"
    echo -e "  - Port 80 (HTTP)"
    echo -e "  - Port 443 (HTTPS)"
    echo -e "  - Port 3000 (Backend API)"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Step 7: Create Application Directory${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "${YELLOW}Creating SPMS directory structure...${NC}"
mkdir -p ~/spms/backend/logs
mkdir -p ~/spms/frontend
mkdir -p ~/spms/scripts
echo -e "${GREEN}✓ Directory structure created${NC}"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Step 8: System Information${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\n${YELLOW}System Information:${NC}"
echo -e "OS: ${GREEN}$(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '"')${NC}"
echo -e "Kernel: ${GREEN}$(uname -r)${NC}"
echo -e "CPU: ${GREEN}$(nproc) cores${NC}"
echo -e "Memory: ${GREEN}$(free -h | awk '/^Mem:/ {print $2}')${NC}"
echo -e "Disk: ${GREEN}$(df -h / | awk 'NR==2 {print $4}') available${NC}"

echo -e "\n${YELLOW}Installed Versions:${NC}"
echo -e "Docker: ${GREEN}$(docker --version)${NC}"
if docker compose version &> /dev/null; then
    echo -e "Docker Compose: ${GREEN}$(docker compose version)${NC}"
else
    echo -e "Docker Compose: ${GREEN}$(docker-compose --version)${NC}"
fi
echo -e "Git: ${GREEN}$(git --version)${NC}"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Step 9: Security Hardening${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "${YELLOW}Applying basic security settings...${NC}"

# Disable password authentication (SSH key only)
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Restart SSH service
if [ "$OS" = "ubuntu" ]; then
    sudo systemctl restart ssh
elif [ "$OS" = "amzn" ]; then
    sudo service sshd restart
fi

echo -e "${GREEN}✓ SSH security hardened${NC}"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Step 10: Setup Swap (Optional)${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if swap exists
if free | grep -q "Swap:.*0"; then
    echo -e "${YELLOW}No swap detected. Creating 2GB swap file...${NC}"
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}✓ Swap file created${NC}"
else
    echo -e "${GREEN}✓ Swap already configured${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Server Preparation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. ${GREEN}Logout and login again${NC} to apply docker group membership"
echo -e "2. Clone your repository or deploy your application"
echo -e "3. Configure environment variables"
echo -e "4. Run docker compose up -d"

echo -e "\n${YELLOW}Important Notes:${NC}"
echo -e "• Docker group membership requires re-login to take effect"
echo -e "• Configure AWS Security Groups for required ports"
echo -e "• Set up SSL certificates for production (Let's Encrypt)"
echo -e "• Configure regular backups for database volumes"
echo -e "• Set up monitoring and logging"

ENDSSH

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Remote Preparation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

# Create a summary file
echo -e "\n${YELLOW}Creating server info file...${NC}"
ssh -i "$PEM_FILE" "$EC2_USER@$SERVER_IP" 'bash -s' << 'ENDSSH2' > /tmp/spms-server-info.txt
echo "SPMS Server Information"
echo "======================="
echo ""
echo "Server IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'N/A')"
echo "Private IP: $(curl -s http://169.254.169.254/latest/meta-data/local-ipv4 2>/dev/null || echo 'N/A')"
echo "Instance Type: $(curl -s http://169.254.169.254/latest/meta-data/instance-type 2>/dev/null || echo 'N/A')"
echo "Availability Zone: $(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone 2>/dev/null || echo 'N/A')"
echo ""
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '"')"
echo "Kernel: $(uname -r)"
echo "CPU Cores: $(nproc)"
echo "Total Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Available Disk: $(df -h / | awk 'NR==2 {print $4}')"
echo ""
echo "Docker: $(docker --version)"
if docker compose version &> /dev/null; then
    echo "Docker Compose: $(docker compose version)"
else
    echo "Docker Compose: $(docker-compose --version)"
fi
echo "Git: $(git --version)"
echo ""
echo "Application Directory: ~/spms"
echo "Logs Directory: ~/spms/backend/logs"
ENDSSH2

cat /tmp/spms-server-info.txt
rm /tmp/spms-server-info.txt

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Quick Reference Commands${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e ""
echo -e "${YELLOW}Connect to server:${NC}"
echo -e "${GREEN}ssh -i $PEM_FILE $EC2_USER@$SERVER_IP${NC}"
echo -e ""
echo -e "${YELLOW}Deploy application:${NC}"
echo -e "${GREEN}cd ~/spms && docker compose up -d --build${NC}"
echo -e ""
echo -e "${YELLOW}View logs:${NC}"
echo -e "${GREEN}docker compose logs -f${NC}"
echo -e ""
echo -e "${YELLOW}Check status:${NC}"
echo -e "${GREEN}docker compose ps${NC}"
echo -e ""
echo -e "${YELLOW}Restart services:${NC}"
echo -e "${GREEN}docker compose restart${NC}"
echo -e ""
echo -e "${YELLOW}Stop services:${NC}"
echo -e "${GREEN}docker compose down${NC}"
echo -e ""
echo -e "${BLUE}========================================${NC}"

echo -e "\n${GREEN}✅ Server is ready for SPMS deployment!${NC}"
echo -e "${YELLOW}⚠️  Remember to logout and login again to use Docker without sudo${NC}"
