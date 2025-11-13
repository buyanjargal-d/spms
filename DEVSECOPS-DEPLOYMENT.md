# DevSecOps Pipeline Deployment Documentation

## Project: SPMS (School Performance Management System)

### Table of Contents
1. [Overview](#overview)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Pipeline Architecture](#pipeline-architecture)
4. [Security Tools Configuration](#security-tools-configuration)
5. [Deployment Process](#deployment-process)
6. [Monitoring & Observability](#monitoring--observability)
7. [Security Report Generation](#security-report-generation)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This DevSecOps pipeline implements a comprehensive security-first approach to deploying the SPMS application. The pipeline integrates multiple security scanning tools at different stages to ensure code quality, security, and compliance.

### Pipeline Stages

```
┌─────────────────────────────────────────────────────────────┐
│                    DevSecOps Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Code Security Analysis (SAST)                            │
│    ├─ SonarCloud/SonarQube                                  │
│    ├─ Semgrep                                               │
│    ├─ GitLeaks (Secrets)                                    │
│    └─ ESLint Security                                       │
├─────────────────────────────────────────────────────────────┤
│ 2. Dependency Security                                       │
│    ├─ NPM Audit                                             │
│    ├─ Snyk                                                  │
│    └─ OWASP Dependency-Check                                │
├─────────────────────────────────────────────────────────────┤
│ 3. Build & Test                                             │
│    ├─ Backend Build                                         │
│    ├─ Frontend Build                                        │
│    └─ Unit Tests with Coverage                              │
├─────────────────────────────────────────────────────────────┤
│ 4. Container Security                                        │
│    ├─ Trivy Container Scanning                              │
│    └─ Docker Scout CVE Analysis                             │
├─────────────────────────────────────────────────────────────┤
│ 5. Infrastructure as Code Security                          │
│    ├─ Checkov IaC Scanning                                  │
│    └─ Hadolint Dockerfile Linting                           │
├─────────────────────────────────────────────────────────────┤
│ 6. Deploy to Production                                      │
│    └─ EC2 Deployment (98.95.194.177)                        │
├─────────────────────────────────────────────────────────────┤
│ 7. Dynamic Security Testing (DAST)                          │
│    ├─ OWASP ZAP Baseline Scan                               │
│    └─ OWASP ZAP Full Scan                                   │
├─────────────────────────────────────────────────────────────┤
│ 8. Security Report Generation                               │
│    └─ Consolidated Security Report                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Setup

### EC2 Instances

#### Production Server (Main Branch)
- **IP Address:** 98.95.194.177
- **Purpose:** Production environment with full DevSecOps pipeline
- **Branch:** main
- **Monitoring:** Prometheus, Grafana, Jaeger
- **Docker Compose:** docker-compose.devsecops.yml

#### Development Server (Developer Branch)
- **IP Address:** [Your DevOps IP]
- **Purpose:** Development and testing
- **Branch:** developer
- **Docker Compose:** docker-compose.prod.yml

### Required Secrets (GitHub Repository)

Configure the following secrets in GitHub repository settings:

#### Database & Backend Secrets
```
DATABASE_URL              # Supabase PostgreSQL connection string
DIRECT_URL                # Supabase direct connection string
JWT_SECRET                # JWT signing secret
JWT_REFRESH_SECRET        # JWT refresh token secret
SUPABASE_URL             # Supabase project URL
SUPABASE_KEY             # Supabase anon/public key
ALLOWED_ORIGINS          # CORS allowed origins
```

#### Security Tool Secrets
```
SONAR_TOKEN              # SonarCloud authentication token
SONAR_PROJECT_KEY        # SonarCloud project key
SONAR_ORGANIZATION       # SonarCloud organization name
SNYK_TOKEN              # Snyk API token
```

#### Deployment Secrets
```
EC2_USERNAME            # EC2 SSH username
EC2_SSH_KEY             # EC2 private SSH key
EC2_SSH_PORT            # EC2 SSH port (default: 22)
EC2_HOST                # EC2 host IP (for developer branch)
```

#### Monitoring Secrets
```
GRAFANA_USER            # Grafana admin username
GRAFANA_PASSWORD        # Grafana admin password
REDIS_PASSWORD          # Redis authentication password
```

---

## Pipeline Architecture

### GitHub Actions Workflow

**File:** `.github/workflows/deploy-devsecops.yml`

#### Trigger Conditions
- Push to `main` branch
- Pull requests to `main` branch
- Manual workflow dispatch

#### Job Dependencies
```
code-security-analysis ─┐
                        ├─► build-and-test ─┐
dependency-security ────┘                   ├─► deploy-production ─► dast-testing
                                            │                            │
container-security ─────────────────────────┤                            │
                                            │                            │
iac-security ───────────────────────────────┘                            │
                                                                         │
security-report ◄────────────────────────────────────────────────────────┘
```

---

## Security Tools Configuration

### 1. SonarCloud/SonarQube (Code Quality & SAST)

**Configuration File:** `sonar-project.properties`

**Features:**
- Static code analysis
- Code quality metrics
- Security vulnerability detection
- Code smell detection
- Test coverage analysis

**Setup:**
1. Create account at [sonarcloud.io](https://sonarcloud.io)
2. Create new project and get project key
3. Generate authentication token
4. Add secrets to GitHub repository

### 2. Semgrep (SAST)

**Configuration:** Inline in workflow

**Security Policies:**
- OWASP Top 10
- Node.js security patterns
- TypeScript best practices
- React security patterns

**No additional setup required** - runs automatically in pipeline.

### 3. GitLeaks (Secret Scanning)

**Configuration:** Default rules

**Features:**
- Scans for hardcoded secrets
- API keys detection
- Password detection
- Token detection

**No additional setup required** - runs automatically in pipeline.

### 4. NPM Audit & Snyk (Dependency Security)

**NPM Audit:** Built-in Node.js tool

**Snyk Setup:**
1. Create account at [snyk.io](https://snyk.io)
2. Generate API token
3. Add `SNYK_TOKEN` to GitHub secrets

### 5. OWASP Dependency-Check

**Configuration File:** `dependency-check-config.xml`

**Features:**
- CVE detection in dependencies
- Multiple format reports (HTML, JSON, XML, CSV, SARIF)
- False positive suppression

**Suppression File:** `dependency-check-suppressions.xml`

### 6. Trivy (Container Security)

**Configuration Files:**
- `trivy.yaml` - Main configuration
- `.trivyignore` - CVE suppressions

**Scan Types:**
- OS package vulnerabilities
- Application dependency vulnerabilities
- Misconfigurations
- Secret detection
- License compliance

### 7. Checkov (IaC Security)

**Configuration File:** `.checkov.yaml`

**Scans:**
- Dockerfile best practices
- GitHub Actions security
- Secret detection
- Compliance policies

### 8. Hadolint (Dockerfile Linting)

**Configuration:** Inline in workflow

**Checks:**
- Dockerfile best practices
- Security recommendations
- Build optimization
- Layer caching

### 9. OWASP ZAP (DAST)

**Configuration Files:**
- `.zap/rules.tsv` - Scanning rules
- `.zap/zap.conf` - ZAP configuration

**Scan Types:**
- Baseline scan (passive)
- Full scan (active + passive)
- Spider crawling
- Ajax spider for SPA

---

## Deployment Process

### Automatic Deployment (Push to Main)

```bash
# 1. Commit and push changes to main branch
git checkout main
git add .
git commit -m "Your commit message"
git push origin main

# 2. GitHub Actions automatically triggers
# 3. Pipeline runs all security scans
# 4. If all checks pass, deploys to production
# 5. Runs DAST after deployment
# 6. Generates security report
```

### Manual Deployment

1. Go to GitHub repository
2. Navigate to **Actions** tab
3. Select **DevSecOps Pipeline - Production**
4. Click **Run workflow**
5. Select `main` branch
6. Click **Run workflow** button

### Deployment Verification

After deployment, verify:

```bash
# 1. Check application health
curl http://98.95.194.177/health
curl http://98.95.194.177:3000/health

# 2. Check Docker containers
ssh ec2-user@98.95.194.177
docker compose -f docker-compose.devsecops.yml ps

# 3. Check logs
docker compose -f docker-compose.devsecops.yml logs -f

# 4. Access monitoring dashboards
# Prometheus: http://98.95.194.177:9090
# Grafana: http://98.95.194.177:3001
# Jaeger: http://98.95.194.177:16686
```

---

## Monitoring & Observability

### Prometheus Metrics Collection

**Access:** http://98.95.194.177:9090

**Metrics Collected:**
- System metrics (CPU, Memory, Disk, Network)
- Container metrics (Docker stats)
- Application metrics (API endpoints, requests, latency)
- Database metrics
- Nginx metrics

**Configuration:** `monitoring/prometheus.yml`

### Grafana Dashboards

**Access:** http://98.95.194.177:3001

**Default Credentials:**
- Username: `admin`
- Password: `admin123` (change in production!)

**Dashboards:**
- System Overview
- Docker Container Metrics
- Application Performance
- Database Monitoring
- Nginx Performance

**Configuration:**
- Datasource: `monitoring/grafana/provisioning/datasources/prometheus.yml`
- Dashboards: `monitoring/grafana/provisioning/dashboards/`

### Jaeger Distributed Tracing

**Access:** http://98.95.194.177:16686

**Features:**
- Request tracing
- Performance bottleneck identification
- Service dependency mapping
- Error tracking

### Container Monitoring

**cAdvisor:** http://98.95.194.177:8080
- Real-time container metrics
- Resource usage
- Performance statistics

**Node Exporter:** Port 9100
- System-level metrics
- Hardware monitoring

---

## Security Report Generation

### Automated Reports

After each pipeline run, the following reports are generated:

#### 1. Security Summary Report
**Location:** GitHub Actions Artifacts → `security-report`

**Contents:**
- Executive summary
- All security scans performed
- Critical/High vulnerabilities
- Recommendations
- Pipeline status

#### 2. Tool-Specific Reports

**ESLint Reports**
- `eslint-backend-report.json`
- `eslint-frontend-report.json`

**NPM Audit Reports**
- `npm-audit-backend.json`
- `npm-audit-frontend.json`

**OWASP Dependency-Check**
- HTML, JSON, XML, CSV formats
- `dependency-check-report/`

**Trivy Container Scans**
- `trivy-backend-report.json`
- `trivy-frontend-report.json`
- SARIF format for GitHub Security

**Checkov IaC Scans**
- `checkov-report.json`
- `checkov-report.sarif`

**Hadolint Dockerfile**
- `hadolint-backend.sarif`
- `hadolint-frontend.sarif`

**OWASP ZAP DAST**
- `report_html.html`
- `report_json.json`
- `report_md.md`

### Downloading Reports

```bash
# Via GitHub CLI
gh run list --workflow=deploy-devsecops.yml
gh run view <run-id>
gh run download <run-id>

# Via GitHub Web UI
1. Go to Actions tab
2. Select workflow run
3. Scroll to Artifacts section
4. Download desired reports
```

### Report Analysis Guide

#### Critical Issues (Fix Immediately)
- ✘ CRITICAL/HIGH vulnerabilities in Trivy scans
- ✘ SQL Injection, XSS findings in ZAP
- ✘ Hardcoded secrets in GitLeaks
- ✘ Authentication/Authorization issues

#### High Priority (Fix Soon)
- ⚠ MEDIUM vulnerabilities in dependencies
- ⚠ Security misconfigurations in Checkov
- ⚠ Code quality issues in SonarCloud
- ⚠ Missing security headers in ZAP

#### Medium Priority (Plan Fix)
- ℹ LOW vulnerabilities
- ℹ Code smells
- ℹ Performance issues
- ℹ Best practice violations

---

## Troubleshooting

### Common Issues

#### 1. Pipeline Fails at Security Scans

**Issue:** SonarCloud scan fails
```
Solution:
- Check SONAR_TOKEN is valid
- Verify project key and organization
- Check quota limits on SonarCloud
```

**Issue:** Snyk scan fails
```
Solution:
- Verify SNYK_TOKEN is valid
- Check Snyk service status
- Review rate limits
```

#### 2. Container Security Scan Failures

**Issue:** Trivy scan finds CRITICAL vulnerabilities
```
Solution:
1. Review vulnerability details
2. Update base images
3. Update dependencies
4. If false positive, add to .trivyignore
```

#### 3. Deployment Failures

**Issue:** SSH connection fails
```bash
# Verify SSH key
ssh -i ~/.ssh/your-key ec2-user@98.95.194.177

# Check security group allows SSH from GitHub IPs
# Verify EC2_SSH_KEY secret is correct
```

**Issue:** Docker containers fail to start
```bash
# Check logs
ssh ec2-user@98.95.194.177
docker compose -f docker-compose.devsecops.yml logs

# Check environment variables
cat .env

# Check disk space
df -h

# Check memory
free -m
```

#### 4. DAST Scan Failures

**Issue:** ZAP cannot reach application
```
Solution:
- Verify application is accessible
- Check health endpoints
- Increase wait time before scan
- Review ZAP rules in .zap/rules.tsv
```

### Debug Mode

Enable debug logging in GitHub Actions:

1. Go to repository Settings
2. Secrets and variables → Actions
3. Add secret: `ACTIONS_STEP_DEBUG` = `true`
4. Add secret: `ACTIONS_RUNNER_DEBUG` = `true`

### Manual Testing

Test security tools locally:

```bash
# Trivy
docker run --rm -v $(pwd):/src aquasec/trivy fs /src

# Checkov
pip install checkov
checkov -d .

# NPM Audit
cd backend && npm audit
cd frontend && npm audit

# Hadolint
docker run --rm -i hadolint/hadolint < backend/Dockerfile
docker run --rm -i hadolint/hadolint < frontend/Dockerfile
```

---

## Environment Variables Structure

### Production Environment (.env)

```bash
# Environment
NODE_ENV=production
IMAGE_TAG=<git-sha>

# API Configuration
PORT=3000
API_PREFIX=/api/v1

# Database
DATABASE_URL=<supabase-connection-string>
DIRECT_URL=<supabase-direct-url>

# JWT
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-refresh-secret>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=<supabase-url>
SUPABASE_KEY=<supabase-anon-key>

# CORS
ALLOWED_ORIGINS=http://98.95.194.177,https://your-domain.com

# DAN Integration
USE_MOCK_DAN=true
DAN_CLIENT_ID=mock-client-id
DAN_CLIENT_SECRET=mock-client-secret
DAN_API_URL=https://dan.gov.mn/api

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/app/logs

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=<secure-password>

# Frontend
VITE_API_URL=/api/v1
```

---

## Security Best Practices

### 1. Secret Management
- ✓ Never commit secrets to repository
- ✓ Use GitHub Secrets for sensitive data
- ✓ Rotate secrets regularly
- ✓ Use different secrets for dev/prod

### 2. Dependency Management
- ✓ Run `npm audit` regularly
- ✓ Update dependencies frequently
- ✓ Review dependency licenses
- ✓ Use lock files (package-lock.json)

### 3. Container Security
- ✓ Use official base images
- ✓ Scan images regularly
- ✓ Don't run containers as root
- ✓ Use multi-stage builds
- ✓ Minimize image layers

### 4. Infrastructure Security
- ✓ Restrict EC2 security groups
- ✓ Use SSH keys (not passwords)
- ✓ Enable firewall rules
- ✓ Regular OS updates
- ✓ Monitor system logs

### 5. Application Security
- ✓ Validate all inputs
- ✓ Use parameterized queries
- ✓ Implement rate limiting
- ✓ Use HTTPS in production
- ✓ Set security headers
- ✓ Implement CSRF protection
- ✓ Use secure session management

---

## Maintenance Schedule

### Daily
- Monitor pipeline execution
- Review critical security alerts
- Check application health

### Weekly
- Review security scan reports
- Update dependencies with patches
- Analyze monitoring metrics
- Review application logs

### Monthly
- Full security audit
- Update all dependencies
- Review and update security policies
- Performance optimization
- Backup verification

### Quarterly
- Major dependency updates
- Security tools update
- Infrastructure review
- Disaster recovery testing

---

## Support & Resources

### Documentation
- GitHub Repository: [Your Repo URL]
- SonarCloud: https://sonarcloud.io
- Snyk: https://snyk.io
- OWASP: https://owasp.org

### Security Tools Documentation
- Trivy: https://aquasecurity.github.io/trivy
- Checkov: https://www.checkov.io
- OWASP ZAP: https://www.zaproxy.org
- Semgrep: https://semgrep.dev

### Monitoring
- Prometheus: https://prometheus.io/docs
- Grafana: https://grafana.com/docs
- Jaeger: https://www.jaegertracing.io/docs

---

## License

[Your License]

---

## Contributors

[Your Team]

---

**Last Updated:** 2025-11-13
**Version:** 1.0.0
**Maintained by:** DevSecOps Team
