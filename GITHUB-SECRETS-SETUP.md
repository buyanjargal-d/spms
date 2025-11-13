# GitHub Secrets Setup Guide

## Overview

This guide provides step-by-step instructions for configuring all required GitHub Secrets for the DevSecOps pipeline.

---

## Table of Contents

1. [Accessing GitHub Secrets](#accessing-github-secrets)
2. [Required Secrets](#required-secrets)
3. [Security Tool Secrets](#security-tool-secrets)
4. [Database Secrets](#database-secrets)
5. [Deployment Secrets](#deployment-secrets)
6. [Monitoring Secrets](#monitoring-secrets)
7. [Verification](#verification)

---

## Accessing GitHub Secrets

### Steps:

1. Go to your GitHub repository: `https://github.com/YOUR_ORG/spms`
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** button
5. Enter the secret name and value
6. Click **Add secret**

---

## Required Secrets

### 1. Database & Backend Secrets

#### DATABASE_URL
**Description:** Supabase PostgreSQL connection string
**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]?[params]`

**How to get:**
1. Log in to Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **Project Settings** → **Database**
4. Copy the **Connection string** under "Connection pooling"
5. Replace `[YOUR-PASSWORD]` with your actual database password

**Example:**
```
postgresql://postgres.abcdefghij:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

#### DIRECT_URL
**Description:** Supabase direct database connection (for migrations)
**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]`

**How to get:**
1. Same location as DATABASE_URL
2. Copy the **Connection string** under "Direct connection"
3. Replace `[YOUR-PASSWORD]` with your actual database password

**Example:**
```
postgresql://postgres.abcdefghij:[PASSWORD]@db.abcdefghij.supabase.co:5432/postgres
```

#### JWT_SECRET
**Description:** Secret key for signing JWT tokens
**How to generate:**
```bash
# Option 1: Using OpenSSL
openssl rand -base64 64

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Option 3: Using online generator
# Visit: https://generate-secret.vercel.app/64
```

**Example:**
```
8k2F9mL3pN7qR5tV1wX6yZ8aB4cD0eF2gH5jK7mP9rS1tU3vW6xY9zA2bC4dE
```

#### JWT_REFRESH_SECRET
**Description:** Secret key for signing JWT refresh tokens (DIFFERENT from JWT_SECRET)
**How to generate:** Same as JWT_SECRET (generate a different value)

**Example:**
```
3nP6qT8vY1aD4fH7jL9mR2sW5xZ8bE0gK3nQ6tV9yB1cF4hM7pS0uX3aE6iO
```

#### SUPABASE_URL
**Description:** Your Supabase project URL

**How to get:**
1. Supabase dashboard → **Project Settings** → **API**
2. Copy **Project URL**

**Example:**
```
https://abcdefghij.supabase.co
```

#### SUPABASE_KEY
**Description:** Supabase anon/public API key

**How to get:**
1. Supabase dashboard → **Project Settings** → **API**
2. Copy **anon public** key

**Example:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4MDAwMDAwMCwiZXhwIjoxOTk1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### ALLOWED_ORIGINS
**Description:** Comma-separated list of allowed CORS origins

**Format:**
```
http://IP_ADDRESS,https://your-domain.com
```

**Example:**
```
http://98.95.194.177,http://localhost:3000,https://spms.example.com
```

---

### 2. Security Tool Secrets

#### SONAR_TOKEN
**Description:** SonarCloud authentication token

**How to get:**
1. Go to SonarCloud: https://sonarcloud.io
2. Log in with your account
3. Click your profile icon → **My Account**
4. Go to **Security** tab
5. Under **Generate Tokens**, enter a name (e.g., "SPMS GitHub Actions")
6. Click **Generate**
7. Copy the token immediately (won't be shown again)

**Example:**
```
sqp_1234567890abcdef1234567890abcdef12345678
```

#### SONAR_PROJECT_KEY
**Description:** Your SonarCloud project key

**How to get:**
1. SonarCloud dashboard → Select your project
2. Project key is shown in the URL and project overview
3. Format: usually `your-org_project-name`

**Example:**
```
your-organization_spms
```

#### SONAR_ORGANIZATION
**Description:** Your SonarCloud organization name

**How to get:**
1. SonarCloud dashboard → Top right corner
2. Organization name is shown in the dropdown

**Example:**
```
your-organization
```

#### SNYK_TOKEN
**Description:** Snyk API authentication token

**How to get:**
1. Go to Snyk: https://app.snyk.io
2. Log in or create account
3. Click your name → **Account settings**
4. Scroll to **API Token** section
5. Click **click to show** to reveal token
6. Copy the token

**Example:**
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### 3. Deployment Secrets

#### EC2_USERNAME
**Description:** SSH username for EC2 instance

**Common values:**
- Amazon Linux: `ec2-user`
- Ubuntu: `ubuntu`
- Debian: `admin`
- RHEL: `ec2-user`

**Example:**
```
ec2-user
```

#### EC2_SSH_KEY
**Description:** Private SSH key for EC2 access

**How to get:**
1. If you have the `.pem` file from AWS EC2 creation:
   ```bash
   cat your-key.pem
   ```
2. Copy the ENTIRE content including header and footer:
   ```
   -----BEGIN RSA PRIVATE KEY-----
   MIIEpAIBAAKCAQEA...
   ...
   -----END RSA PRIVATE KEY-----
   ```

**Important:**
- Include the BEGIN and END lines
- Include all line breaks
- Do not modify the key in any way

#### EC2_SSH_PORT
**Description:** SSH port number (optional, defaults to 22)

**Example:**
```
22
```

#### EC2_HOST
**Description:** EC2 instance IP address for developer branch (the DevOps server)

**How to get:**
1. AWS Console → EC2 → Instances
2. Select your instance
3. Copy **Public IPv4 address**

**Example:**
```
54.123.45.67
```

**Note:** The production server (98.95.194.177) is hardcoded in the workflow.

---

### 4. Monitoring Secrets

#### GRAFANA_USER
**Description:** Grafana admin username

**Example:**
```
admin
```

#### GRAFANA_PASSWORD
**Description:** Grafana admin password

**How to generate:** Create a strong password
```bash
# Generate random password
openssl rand -base64 32
```

**Example:**
```
YourSecureGrafanaPassword123!@#
```

#### REDIS_PASSWORD
**Description:** Redis authentication password

**How to generate:**
```bash
openssl rand -base64 32
```

**Example:**
```
YourSecureRedisPassword456!@#
```

---

## Complete Secrets Checklist

Use this checklist to ensure all secrets are configured:

### Database & Backend
- [ ] DATABASE_URL
- [ ] DIRECT_URL
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] SUPABASE_URL
- [ ] SUPABASE_KEY
- [ ] ALLOWED_ORIGINS

### Security Tools
- [ ] SONAR_TOKEN
- [ ] SONAR_PROJECT_KEY
- [ ] SONAR_ORGANIZATION
- [ ] SNYK_TOKEN

### Deployment
- [ ] EC2_USERNAME
- [ ] EC2_SSH_KEY
- [ ] EC2_SSH_PORT (optional)
- [ ] EC2_HOST (for developer branch)

### Monitoring
- [ ] GRAFANA_USER
- [ ] GRAFANA_PASSWORD
- [ ] REDIS_PASSWORD

---

## Verification

### 1. Verify Secrets are Set

Go to: `Settings` → `Secrets and variables` → `Actions`

You should see all secret names listed (values are hidden).

### 2. Test Database Connection

```bash
# Test DATABASE_URL connection
psql "YOUR_DATABASE_URL" -c "SELECT version();"
```

### 3. Test Supabase Connection

```bash
# Test API endpoint
curl -X GET 'YOUR_SUPABASE_URL/rest/v1/' \
  -H "apikey: YOUR_SUPABASE_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_KEY"
```

### 4. Test SSH Connection

```bash
# Test SSH key
ssh -i your-key.pem ec2-user@98.95.194.177
```

### 5. Test Security Tools

**SonarCloud:**
```bash
# Test token
curl -u YOUR_SONAR_TOKEN: https://sonarcloud.io/api/authentication/validate
```

**Snyk:**
```bash
# Test token
curl -X GET 'https://api.snyk.io/v1/user/me' \
  -H "Authorization: token YOUR_SNYK_TOKEN"
```

### 6. Run Workflow

1. Go to **Actions** tab
2. Select **DevSecOps Pipeline - Production**
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow**
6. Monitor the execution for any secret-related errors

---

## Security Best Practices

### 1. Secret Rotation

**Recommended Schedule:**
- Database passwords: Every 90 days
- JWT secrets: Every 180 days
- API tokens: When team members leave
- SSH keys: Every 6 months

### 2. Access Control

- Limit who can view/edit secrets
- Use GitHub organization teams
- Enable audit logging
- Review access regularly

### 3. Secret Storage

- ✅ Store in GitHub Secrets (encrypted)
- ✅ Use environment-specific secrets
- ❌ Never commit secrets to repository
- ❌ Never log secrets in workflows
- ❌ Never echo secrets in scripts

### 4. Monitoring

- Enable GitHub Actions logs
- Monitor failed authentication attempts
- Review secret usage in workflow runs
- Set up alerts for unauthorized access

---

## Troubleshooting

### Issue: "Secret not found"
**Solution:** Verify secret name matches exactly (case-sensitive)

### Issue: "Invalid database connection"
**Solution:**
- Check DATABASE_URL format
- Verify password is correct
- Test connection manually
- Check IP whitelist in Supabase

### Issue: "SSH connection failed"
**Solution:**
- Verify EC2_SSH_KEY includes BEGIN/END lines
- Check EC2 security group allows SSH from GitHub IPs
- Test SSH key locally first
- Verify EC2 instance is running

### Issue: "SonarCloud authentication failed"
**Solution:**
- Regenerate SONAR_TOKEN
- Verify token has not expired
- Check organization and project key are correct

### Issue: "Snyk authentication failed"
**Solution:**
- Verify SNYK_TOKEN is valid
- Check token permissions
- Ensure organization access

---

## GitHub Actions IP Ranges

If you need to whitelist GitHub Actions IPs for security groups:

**GitHub Meta API:**
```bash
curl https://api.github.com/meta | jq .actions
```

**Common ranges (as of 2024):**
- `185.199.108.0/22`
- `140.82.112.0/20`
- `143.55.64.0/20`
- `20.201.28.151/32`
- `20.205.243.166/32`
- And more...

**Recommendation:** Use dynamic IP fetching or VPN endpoint for better security.

---

## Support

For issues with specific services:

- **GitHub Secrets:** https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Supabase:** https://supabase.com/docs
- **SonarCloud:** https://docs.sonarcloud.io
- **Snyk:** https://docs.snyk.io
- **AWS EC2:** https://docs.aws.amazon.com/ec2

---

## Quick Reference

### Generate All Secrets Script

```bash
#!/bin/bash
# Generate random secrets for SPMS

echo "=== JWT Secrets ==="
echo "JWT_SECRET:"
openssl rand -base64 64
echo ""
echo "JWT_REFRESH_SECRET:"
openssl rand -base64 64
echo ""

echo "=== Monitoring Secrets ==="
echo "GRAFANA_PASSWORD:"
openssl rand -base64 32
echo ""
echo "REDIS_PASSWORD:"
openssl rand -base64 32
echo ""

echo "=== Generated secrets above ==="
echo "Remember to:"
echo "1. Copy each secret value"
echo "2. Add to GitHub Secrets"
echo "3. Never commit these values"
```

Save as `generate-secrets.sh` and run:
```bash
chmod +x generate-secrets.sh
./generate-secrets.sh
```

---

**Last Updated:** 2025-11-13
**Version:** 1.0.0
