#!/bin/bash

# CloudWatch Alarms Setup Script
# Creates CloudWatch alarms for critical metrics

set -e

echo "========================================="
echo "Creating CloudWatch Alarms for SPMS"
echo "========================================="
echo ""

# Configuration
AWS_REGION="us-east-1"
SNS_TOPIC_NAME="spms-alerts"
INSTANCE_ID=$(ec2-metadata --instance-id | cut -d " " -f 2)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Creating SNS topic for alerts...${NC}"
SNS_TOPIC_ARN=$(aws sns create-topic \
  --name $SNS_TOPIC_NAME \
  --region $AWS_REGION \
  --output text \
  --query 'TopicArn' 2>/dev/null || echo "")

if [ -z "$SNS_TOPIC_ARN" ]; then
  echo -e "${RED}✗ Failed to create SNS topic${NC}"
  echo "Please ensure AWS CLI is configured with proper credentials"
  exit 1
fi

echo -e "${GREEN}✓ SNS Topic ARN: $SNS_TOPIC_ARN${NC}"
echo ""

echo -e "${YELLOW}Note: Add email subscription to receive alerts:${NC}"
echo "aws sns subscribe \\"
echo "  --topic-arn $SNS_TOPIC_ARN \\"
echo "  --protocol email \\"
echo "  --notification-endpoint your-email@example.com"
echo ""

# Create High CPU Alarm
echo -e "${YELLOW}Creating High CPU alarm...${NC}"
aws cloudwatch put-metric-alarm \
  --alarm-name "SPMS-High-CPU-Usage" \
  --alarm-description "Alert when CPU usage is above 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=$INSTANCE_ID \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $AWS_REGION
echo -e "${GREEN}✓ High CPU alarm created${NC}"

# Create High Memory Alarm
echo -e "${YELLOW}Creating High Memory alarm...${NC}"
aws cloudwatch put-metric-alarm \
  --alarm-name "SPMS-High-Memory-Usage" \
  --alarm-description "Alert when memory usage is above 85%" \
  --metric-name MEM_USED \
  --namespace SPMS/Application \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $AWS_REGION
echo -e "${GREEN}✓ High Memory alarm created${NC}"

# Create High Disk Usage Alarm
echo -e "${YELLOW}Creating High Disk Usage alarm...${NC}"
aws cloudwatch put-metric-alarm \
  --alarm-name "SPMS-High-Disk-Usage" \
  --alarm-description "Alert when disk usage is above 85%" \
  --metric-name DISK_USED \
  --namespace SPMS/Application \
  --statistic Average \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 85 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $AWS_REGION
echo -e "${GREEN}✓ High Disk Usage alarm created${NC}"

# Create StatusCheckFailed Alarm
echo -e "${YELLOW}Creating EC2 Status Check alarm...${NC}"
aws cloudwatch put-metric-alarm \
  --alarm-name "SPMS-EC2-Status-Check-Failed" \
  --alarm-description "Alert when EC2 status check fails" \
  --metric-name StatusCheckFailed \
  --namespace AWS/EC2 \
  --statistic Maximum \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 0 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=InstanceId,Value=$INSTANCE_ID \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $AWS_REGION
echo -e "${GREEN}✓ Status Check alarm created${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}CloudWatch Alarms Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Created alarms:"
echo "  1. High CPU Usage (>80%)"
echo "  2. High Memory Usage (>85%)"
echo "  3. High Disk Usage (>85%)"
echo "  4. EC2 Status Check Failed"
echo ""
echo "Subscribe to alerts:"
echo "aws sns subscribe \\"
echo "  --topic-arn $SNS_TOPIC_ARN \\"
echo "  --protocol email \\"
echo "  --notification-endpoint your-email@example.com \\"
echo "  --region $AWS_REGION"
echo ""
