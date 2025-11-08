# SPMS Deployment Scripts

This directory contains scripts for setting up and managing the SPMS application infrastructure.

## Scripts Overview

### Initial Setup

#### `first-time-ec2-setup.sh`
**Purpose**: First-time setup of a fresh EC2 instance

**What it does**:
- Updates system packages
- Installs Docker and Docker Compose
- Installs Git
- Clones the SPMS repository (developer branch)
- Creates initial `.env` file for backend
- Configures firewall rules

**Usage**:
```bash
# On EC2 instance
chmod +x first-time-ec2-setup.sh
./first-time-ec2-setup.sh
```

**When to use**: Run once on a new EC2 instance before first deployment

---

### Monitoring Setup

#### `setup-cloudwatch.sh`
**Purpose**: Install and configure AWS CloudWatch monitoring

**What it does**:
- Downloads and installs CloudWatch agent
- Configures log collection from system and application
- Sets up metric collection (CPU, memory, disk, network)
- Configures Docker logging
- Starts the CloudWatch agent

**Usage**:
```bash
# On EC2 instance (after first-time setup)
cd ~/spms
./scripts/setup-cloudwatch.sh
```

**Prerequisites**:
- EC2 instance must have IAM role with CloudWatch permissions
- See `docs/CLOUDWATCH_SETUP.md` for IAM setup

---

#### `create-cloudwatch-alarms.sh`
**Purpose**: Create CloudWatch alarms for critical metrics

**What it does**:
- Creates SNS topic for alerts
- Sets up alarms for:
  - High CPU usage (>80%)
  - High memory usage (>85%)
  - High disk usage (>85%)
  - EC2 status check failures

**Usage**:
```bash
# On EC2 instance (after CloudWatch agent is running)
cd ~/spms
./scripts/create-cloudwatch-alarms.sh

# Subscribe to email alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT:spms-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region us-east-1
```

**Prerequisites**:
- CloudWatch agent must be installed and running
- AWS CLI configured with proper credentials

---

## Configuration Files

### `cloudwatch-config.json`
CloudWatch agent configuration file that defines:
- Log files to collect
- Metrics to gather
- Collection intervals
- Log retention periods

**Location on EC2**: `/opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json`

### `cloudwatch-dashboard.json`
CloudWatch dashboard configuration for visualizing metrics and logs.

**To create dashboard**:
```bash
aws cloudwatch put-dashboard \
  --dashboard-name SPMS-Production-Dashboard \
  --dashboard-body file://scripts/cloudwatch-dashboard.json \
  --region us-east-1
```

---

## Deployment Workflow

### Initial Setup (Run once):
```bash
# 1. Run first-time setup
./scripts/first-time-ec2-setup.sh

# 2. Log out and log back in (for Docker group permissions)
exit
ssh -i your-key.pem ubuntu@EC2_IP

# 3. Set up CloudWatch monitoring
cd ~/spms
./scripts/setup-cloudwatch.sh

# 4. Create CloudWatch alarms
./scripts/create-cloudwatch-alarms.sh

# 5. Subscribe to email alerts (replace with your email)
aws sns subscribe \
  --topic-arn $(aws sns list-topics --query 'Topics[?contains(TopicArn, `spms-alerts`)].TopicArn' --output text) \
  --protocol email \
  --notification-endpoint your-email@example.com
```

### Regular Deployments:
After initial setup, GitHub Actions handles deployments automatically when you push to `developer` or `main` branch.

Manual deployment:
```bash
cd ~/spms
git pull origin developer
docker compose down
docker compose up -d --build
```

---

## Troubleshooting

### CloudWatch Agent Issues

**Check agent status**:
```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a status -m ec2
```

**View agent logs**:
```bash
sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
```

**Restart agent**:
```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a stop -m ec2

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json
```

### Docker Issues

**View container logs**:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

**Rebuild containers**:
```bash
docker compose down
docker compose up -d --build --force-recreate
```

---

## Security Notes

- Never commit `.env` files to version control
- Keep your SSH keys secure
- Rotate AWS credentials regularly
- Review CloudWatch logs for security incidents
- Keep Docker images updated

---

## Cost Optimization

### CloudWatch Costs:
- Logs: ~$0.50/GB ingested, $0.03/GB stored/month
- Custom metrics: First 10 free, then $0.30/metric/month
- Alarms: First 10 free, then $0.10/alarm/month

### Tips:
- Adjust log retention periods in `cloudwatch-config.json`
- Use log filters to reduce ingestion
- Delete old log groups you don't need
- Set up AWS billing alerts

---

## Additional Resources

- [Full CloudWatch Setup Guide](../docs/CLOUDWATCH_SETUP.md)
- [GitHub Actions Deployment Guide](../.github/workflows/README.md)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
