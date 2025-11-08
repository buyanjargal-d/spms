#!/bin/bash

# CloudWatch Agent Setup Script for EC2
# Run this script on your EC2 instance to install and configure CloudWatch monitoring

set -e

echo "========================================="
echo "SPMS - CloudWatch Agent Setup"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as ubuntu user
CURRENT_USER=$(whoami)
if [ "$CURRENT_USER" != "ubuntu" ] && [ "$CURRENT_USER" != "ec2-user" ]; then
    echo -e "${RED}Error: This script should be run as ubuntu or ec2-user${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Downloading CloudWatch Agent...${NC}"
wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
echo -e "${GREEN}✓ Downloaded${NC}"
echo ""

echo -e "${YELLOW}Step 2: Installing CloudWatch Agent...${NC}"
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
rm -f ./amazon-cloudwatch-agent.deb
echo -e "${GREEN}✓ Installed${NC}"
echo ""

echo -e "${YELLOW}Step 3: Creating CloudWatch configuration...${NC}"
# Create config directory if it doesn't exist
sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc/

# Copy the configuration file
if [ -f ~/spms/scripts/cloudwatch-config.json ]; then
    sudo cp ~/spms/scripts/cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json
    echo -e "${GREEN}✓ Configuration copied${NC}"
else
    echo -e "${RED}✗ Configuration file not found at ~/spms/scripts/cloudwatch-config.json${NC}"
    echo "Please ensure the repository is cloned and configuration file exists."
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 4: Creating log directories...${NC}"
# Ensure log directories exist
sudo mkdir -p /home/$CURRENT_USER/spms/backend/logs
sudo chown -R $CURRENT_USER:$CURRENT_USER /home/$CURRENT_USER/spms/backend/logs
echo -e "${GREEN}✓ Log directories created${NC}"
echo ""

echo -e "${YELLOW}Step 5: Starting CloudWatch Agent...${NC}"
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json

# Check if agent is running
sleep 3
if sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a query \
    -m ec2 \
    -c default | grep -q "running"; then
    echo -e "${GREEN}✓ CloudWatch Agent is running${NC}"
else
    echo -e "${RED}✗ CloudWatch Agent failed to start${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 6: Configuring Docker logging driver...${NC}"
# Create Docker daemon configuration for CloudWatch logs
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "labels": "production"
  }
}
EOF

# Restart Docker to apply changes
sudo systemctl restart docker
echo -e "${GREEN}✓ Docker logging configured${NC}"
echo ""

echo "========================================="
echo -e "${GREEN}CloudWatch Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Verify in AWS Console:"
echo "   - Go to CloudWatch > Log groups"
echo "   - Look for /aws/ec2/spms/* log groups"
echo ""
echo "2. View metrics:"
echo "   - CloudWatch > Metrics > SPMS/Application"
echo ""
echo "3. Restart your application to start sending logs:"
echo "   cd ~/spms"
echo "   docker compose down"
echo "   docker compose up -d"
echo ""
echo "4. Check agent status:"
echo "   sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a query -m ec2"
echo ""
