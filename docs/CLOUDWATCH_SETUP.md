# CloudWatch Monitoring Setup Guide

This guide will help you set up AWS CloudWatch monitoring for your SPMS application.

## Prerequisites

1. **EC2 Instance with IAM Role**: Your EC2 instance needs an IAM role with CloudWatch permissions
2. **AWS CLI configured**: Should be pre-configured on Amazon Linux/Ubuntu EC2 instances
3. **SPMS Application**: Already deployed and running

## Required IAM Permissions

Your EC2 instance IAM role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData",
        "ec2:DescribeVolumes",
        "ec2:DescribeTags",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams",
        "logs:DescribeLogGroups",
        "logs:CreateLogStream",
        "logs:CreateLogGroup"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/AmazonCloudWatch-*"
    }
  ]
}
```

## Step 1: Attach IAM Role to EC2 Instance

### Via AWS Console:

1. Go to **EC2 Console** → Select your instance
2. **Actions** → **Security** → **Modify IAM role**
3. Create a new role or select existing role with CloudWatch permissions
4. Role name suggestion: `SPMS-EC2-CloudWatch-Role`
5. Attach policies:
   - `CloudWatchAgentServerPolicy` (AWS managed)
   - Or create custom policy with above permissions

### Via AWS CLI:

```bash
# Create the IAM role
aws iam create-role \
  --role-name SPMS-EC2-CloudWatch-Role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ec2.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach CloudWatch policy
aws iam attach-role-policy \
  --role-name SPMS-EC2-CloudWatch-Role \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy

# Create instance profile
aws iam create-instance-profile \
  --instance-profile-name SPMS-EC2-CloudWatch-Profile

# Add role to instance profile
aws iam add-role-to-instance-profile \
  --instance-profile-name SPMS-EC2-CloudWatch-Profile \
  --role-name SPMS-EC2-CloudWatch-Role

# Attach to EC2 instance (replace with your instance ID)
aws ec2 associate-iam-instance-profile \
  --instance-id i-1234567890abcdef0 \
  --iam-instance-profile Name=SPMS-EC2-CloudWatch-Profile
```

## Step 2: Install CloudWatch Agent on EC2

SSH into your EC2 instance and run:

```bash
cd ~/spms
./scripts/setup-cloudwatch.sh
```

This script will:
- Download and install CloudWatch agent
- Configure log collection for:
  - System logs (`/var/log/syslog`)
  - Cloud-init logs
  - Backend application logs
- Set up metric collection (CPU, Memory, Disk, Network)
- Configure Docker logging

## Step 3: Verify CloudWatch Agent

```bash
# Check agent status
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a query -m ec2 -c default

# View agent logs
sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
```

## Step 4: View Logs in AWS Console

1. Go to **CloudWatch Console** → **Log groups**
2. You should see these log groups:
   - `/aws/ec2/spms/backend` - Backend application logs
   - `/aws/ec2/spms/syslog` - System logs
   - `/aws/ec2/spms/cloud-init` - EC2 initialization logs

## Step 5: View Metrics

1. Go to **CloudWatch Console** → **Metrics** → **All metrics**
2. Select **SPMS/Application** namespace
3. Available metrics:
   - CPU_IDLE, CPU_IOWAIT
   - MEM_USED (Memory usage %)
   - DISK_USED (Disk usage %)
   - SWAP_USED (Swap usage %)
   - TCP_ESTABLISHED (Active connections)

## Step 6: Create Dashboard

### Option A: Via AWS Console

1. Go to **CloudWatch** → **Dashboards** → **Create dashboard**
2. Name: `SPMS-Production-Dashboard`
3. Add widgets for metrics you want to monitor

### Option B: Via AWS CLI

```bash
# Create dashboard from config file
aws cloudwatch put-dashboard \
  --dashboard-name SPMS-Production-Dashboard \
  --dashboard-body file://~/spms/scripts/cloudwatch-dashboard.json \
  --region us-east-1
```

## Step 7: Set Up Alarms

```bash
cd ~/spms
./scripts/create-cloudwatch-alarms.sh
```

This creates alarms for:
- High CPU usage (>80%)
- High memory usage (>85%)
- High disk usage (>85%)
- EC2 status check failures

### Subscribe to Alerts

```bash
# Replace with your email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT:spms-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region us-east-1
```

**Important**: Check your email and confirm the subscription!

## Step 8: Test the Setup

### Generate some logs:

```bash
# Restart containers to generate logs
cd ~/spms
docker compose down
docker compose up -d

# Generate test traffic
curl http://localhost:3000/health
curl http://localhost/
```

### Check CloudWatch:

1. Wait 2-3 minutes for data to appear
2. Go to **CloudWatch** → **Log groups** → `/aws/ec2/spms/backend`
3. Click on the log stream
4. You should see application logs

## Monitoring Best Practices

### 1. **Log Retention**
Current configuration keeps logs for:
- Backend logs: 30 days
- System logs: 7 days

Adjust in `cloudwatch-config.json` if needed.

### 2. **Cost Optimization**
- Logs: ~$0.50/GB ingested, $0.03/GB stored
- Metrics: Free tier covers 10 custom metrics
- Set up billing alerts!

### 3. **Useful CloudWatch Insights Queries**

#### Find errors in backend logs:
```
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 50
```

#### API response times:
```
fields @timestamp, @message
| filter @message like /response time/
| parse @message /response time: (?<responseTime>\d+)ms/
| stats avg(responseTime), max(responseTime), min(responseTime) by bin(5m)
```

#### Count requests by endpoint:
```
fields @timestamp, @message
| filter @message like /GET|POST|PUT|DELETE/
| parse @message /(?<method>GET|POST|PUT|DELETE) (?<endpoint>\/[^ ]*)/
| stats count() by endpoint
| sort count() desc
```

## Troubleshooting

### Agent not starting:
```bash
# Check agent status
sudo systemctl status amazon-cloudwatch-agent

# View detailed logs
sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log

# Restart agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a stop -m ec2

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/cloudwatch-config.json
```

### No metrics appearing:
- Check IAM role permissions
- Verify agent is running
- Wait 5-10 minutes for initial data

### No logs appearing:
- Check log file paths exist
- Verify log files have content
- Check IAM role has `logs:CreateLogGroup` permission

## Integration with GitHub Actions

The deployment workflow automatically restarts containers, which will generate logs in CloudWatch. No additional configuration needed!

## Next Steps: DevSecOps

Once CloudWatch is set up, you have completed the **DevOps pipeline**:
- ✅ CI/CD with GitHub Actions
- ✅ Containerized deployment
- ✅ Automated infrastructure setup
- ✅ Monitoring and logging

Next, add **DevSecOps** features:
1. SAST (Static Application Security Testing)
2. Dependency scanning
3. Container image scanning
4. Secret management
5. Security compliance checking

## Resources

- [CloudWatch Agent Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html)
- [CloudWatch Logs Insights Query Syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
- [CloudWatch Pricing](https://aws.amazon.com/cloudwatch/pricing/)
