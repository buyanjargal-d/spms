# DevSecOps Pipeline - Quick Start Guide

## 🚀 Overview

This document provides a quick reference for the SPMS DevSecOps pipeline implementation.

---

## 📁 Files Created

### 1. GitHub Actions Workflows

| File | Purpose | Branch |
|------|---------|--------|
| `.github/workflows/deploy-simple.yml` | Simple DevOps pipeline | developer |
| `.github/workflows/deploy-devsecops.yml` | Full DevSecOps pipeline | main |

### 2. Docker Compose Files

| File | Purpose | Server |
|------|---------|--------|
| `docker-compose.yml` | Basic deployment | Developer server |
| `docker-compose.devsecops.yml` | Production with monitoring | Production (98.95.194.177) |

### 3. Security Tool Configurations

| File | Tool | Purpose |
|------|------|---------|
| `sonar-project.properties` | SonarCloud/SonarQube | Code quality & SAST |
| `.zap/rules.tsv` | OWASP ZAP | DAST scanning rules |
| `.zap/zap.conf` | OWASP ZAP | DAST configuration |
| `trivy.yaml` | Trivy | Container security |
| `.trivyignore` | Trivy | CVE suppressions |
| `.checkov.yaml` | Checkov | IaC security |
| `dependency-check-config.xml` | OWASP Dep-Check | Dependency scanning |
| `dependency-check-suppressions.xml` | OWASP Dep-Check | False positives |

### 4. Monitoring Configurations

| File | Purpose |
|------|---------|
| `monitoring/prometheus.yml` | Metrics collection |
| `monitoring/grafana/provisioning/datasources/prometheus.yml` | Grafana datasource |
| `monitoring/grafana/provisioning/dashboards/dashboard.yml` | Dashboard config |

### 5. Documentation

| File | Purpose |
|------|---------|
| `DEVSECOPS-DEPLOYMENT.md` | Complete deployment guide |
| `SECURITY-REPORT-TEMPLATE.md` | Security report template |
| `GITHUB-SECRETS-SETUP.md` | Secrets configuration guide |
| `DEVSECOPS-README.md` | This quick start guide |

---

## 🎯 Quick Setup (5 Steps)

### Step 1: Configure GitHub Secrets

See `GITHUB-SECRETS-SETUP.md` for detailed instructions.

**Required Secrets:**
```
Database:
- DATABASE_URL
- DIRECT_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- SUPABASE_URL
- SUPABASE_KEY
- ALLOWED_ORIGINS

Security Tools:
- SONAR_TOKEN
- SONAR_PROJECT_KEY
- SONAR_ORGANIZATION
- SNYK_TOKEN

Deployment:
- EC2_USERNAME
- EC2_SSH_KEY
- EC2_SSH_PORT
- EC2_HOST

Monitoring:
- GRAFANA_USER
- GRAFANA_PASSWORD
- REDIS_PASSWORD
```

### Step 2: Configure Security Tools

1. **SonarCloud**
   - Create account: https://sonarcloud.io
   - Create project
   - Get token and project key
   - Update `sonar-project.properties`

2. **Snyk**
   - Create account: https://snyk.io
   - Get API token
   - Add to GitHub secrets

3. **Other tools** - No additional setup required!

### Step 3: Prepare EC2 Instance

```bash
# SSH into production server
ssh ec2-user@98.95.194.177

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Setup SSH key for GitHub
ssh-keygen -t ed25519 -C "ec2-spms@example.com"
cat ~/.ssh/id_ed25519.pub
# Add this to GitHub repo Deploy Keys

# Verify
docker --version
docker-compose --version
```

### Step 4: Push to Main Branch

```bash
# From your local machine
git checkout main
git add .
git commit -m "Setup DevSecOps pipeline"
git push origin main
```

### Step 5: Monitor Pipeline

1. Go to GitHub repository
2. Click **Actions** tab
3. Watch **DevSecOps Pipeline - Production** run
4. Review security reports in artifacts

---

## 📊 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  PUSH TO MAIN BRANCH                    │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │   GitHub Actions       │
         │   Workflow Triggered   │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌────────┐    ┌────────────┐   ┌──────────┐
│ SAST   │    │ Dependency │   │  Build   │
│        │    │  Security  │   │  & Test  │
└───┬────┘    └─────┬──────┘   └────┬─────┘
    │               │               │
    │  ┌────────────┴───────┐      │
    │  │                    │      │
    ▼  ▼                    ▼      ▼
┌────────────┐        ┌──────────────┐
│ Container  │        │     IaC      │
│  Security  │        │   Security   │
└─────┬──────┘        └──────┬───────┘
      │                      │
      └──────────┬───────────┘
                 │
                 ▼
         ┌──────────────┐
         │    Deploy    │
         │  Production  │
         │ 98.95.194.177│
         └───────┬──────┘
                 │
                 ▼
         ┌──────────────┐
         │     DAST     │
         │  (OWASP ZAP) │
         └───────┬──────┘
                 │
                 ▼
         ┌──────────────┐
         │   Security   │
         │    Report    │
         └──────────────┘
```

---

## 🛠️ Tools Integrated

### SAST (Static Application Security Testing)
- ✅ SonarCloud - Code quality & vulnerabilities
- ✅ Semgrep - Security pattern matching
- ✅ GitLeaks - Secret detection
- ✅ ESLint - Linting & security rules

### SCA (Software Composition Analysis)
- ✅ NPM Audit - Dependency vulnerabilities
- ✅ Snyk - Vulnerability database
- ✅ OWASP Dependency-Check - CVE detection

### Container Security
- ✅ Trivy - Container & filesystem scanning
- ✅ Docker Scout - CVE analysis

### IaC Security
- ✅ Checkov - Infrastructure as Code scanning
- ✅ Hadolint - Dockerfile best practices

### DAST (Dynamic Application Security Testing)
- ✅ OWASP ZAP - Runtime security testing

### Monitoring
- ✅ Prometheus - Metrics collection
- ✅ Grafana - Visualization
- ✅ Jaeger - Distributed tracing
- ✅ cAdvisor - Container monitoring
- ✅ Node Exporter - System metrics

---

## 🌐 Deployment Environments

### Developer Branch → DevOps Server
- **Branch:** `developer`
- **Server:** [Your IP]
- **Workflow:** `.github/workflows/deploy-simple.yml`
- **Docker Compose:** `docker-compose.yml`
- **Purpose:** Development & testing

### Main Branch → Production Server
- **Branch:** `main`
- **Server:** 98.95.194.177
- **Workflow:** `.github/workflows/deploy-devsecops.yml`
- **Docker Compose:** `docker-compose.devsecops.yml`
- **Purpose:** Production with full security

---

## 📈 Monitoring Dashboards

Once deployed, access:

| Service | URL | Credentials |
|---------|-----|-------------|
| Application | http://98.95.194.177 | - |
| Backend API | http://98.95.194.177:3000 | - |
| Prometheus | http://98.95.194.177:9090 | - |
| Grafana | http://98.95.194.177:3001 | admin / admin123 |
| Jaeger | http://98.95.194.177:16686 | - |
| cAdvisor | http://98.95.194.177:8080 | - |

**⚠️ Change default passwords in production!**

---

## 📋 Security Reports

After each pipeline run, download reports from GitHub Actions artifacts:

1. **Go to Actions tab**
2. **Click on latest workflow run**
3. **Scroll to Artifacts section**
4. **Download:**
   - `security-report` - Consolidated summary
   - `eslint-reports` - Code linting results
   - `npm-audit-reports` - Dependency vulnerabilities
   - `dependency-check-report` - CVE analysis
   - `trivy-reports` - Container security
   - `checkov-reports` - IaC security
   - `hadolint-reports` - Dockerfile analysis
   - `zap-reports` - DAST findings

---

## 🔄 Workflow Triggers

### Automatic Triggers

```bash
# Push to main → Full DevSecOps pipeline
git push origin main

# Push to developer → Simple DevOps
git push origin developer

# Pull Request to main → Security scans only (no deploy)
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR to main
```

### Manual Trigger

1. Go to **Actions** tab
2. Select workflow
3. Click **Run workflow**
4. Choose branch
5. Click **Run workflow** button

---

## 🐛 Troubleshooting

### Pipeline Fails - Check Order:

1. **Secrets**
   - Verify all secrets are set
   - Check secret names match exactly
   - Test connections manually

2. **Security Scans**
   - Review failed step logs
   - Check tool-specific configurations
   - Verify API tokens are valid

3. **Deployment**
   - SSH connection works
   - EC2 security groups allow access
   - Docker is installed and running
   - GitHub deploy key is added

4. **DAST**
   - Application is accessible
   - Health endpoints respond
   - ZAP rules are correct

### Common Issues

**"Secret not found"**
```
→ Check secret name spelling
→ Verify secret is set in repository settings
```

**"SSH connection failed"**
```
→ Test SSH manually: ssh ec2-user@98.95.194.177
→ Check EC2 security group
→ Verify SSH key format in secret
```

**"Container build failed"**
```
→ Check Dockerfile syntax
→ Verify base image availability
→ Review build logs
```

**"Health check failed"**
```
→ Check application logs
→ Verify environment variables
→ Test endpoints manually
```

---

## 📖 Additional Resources

### Documentation
- [Full Deployment Guide](./DEVSECOPS-DEPLOYMENT.md)
- [Security Report Template](./SECURITY-REPORT-TEMPLATE.md)
- [GitHub Secrets Setup](./GITHUB-SECRETS-SETUP.md)

### External Tools
- [SonarCloud Docs](https://docs.sonarcloud.io)
- [Snyk Docs](https://docs.snyk.io)
- [Trivy Docs](https://aquasecurity.github.io/trivy)
- [OWASP ZAP Docs](https://www.zaproxy.org/docs)
- [Prometheus Docs](https://prometheus.io/docs)
- [Grafana Docs](https://grafana.com/docs)

### Security References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Guidelines](https://www.nist.gov/cyberframework)

---

## ✅ Checklist Before Production

### Pre-Deployment
- [ ] All GitHub secrets configured
- [ ] Security tool accounts created
- [ ] EC2 instance prepared
- [ ] SSH keys configured
- [ ] Security groups configured
- [ ] Domain/DNS configured (if using)

### Security Configuration
- [ ] Change default passwords
- [ ] Review security scan results
- [ ] Address critical vulnerabilities
- [ ] Configure SSL/TLS certificates
- [ ] Set up firewall rules
- [ ] Enable monitoring alerts

### Testing
- [ ] Pipeline runs successfully
- [ ] All security scans pass
- [ ] Application deploys correctly
- [ ] Health checks pass
- [ ] Monitoring dashboards working
- [ ] DAST scans complete

### Documentation
- [ ] Document custom configurations
- [ ] Update team wiki/docs
- [ ] Share monitoring URLs
- [ ] Document incident response
- [ ] Create runbooks

---

## 🤝 Support

### Getting Help

1. **Pipeline Issues**
   - Check GitHub Actions logs
   - Review security scan reports
   - Consult deployment documentation

2. **Security Tool Issues**
   - Check tool-specific documentation
   - Verify API tokens and credentials
   - Review configuration files

3. **Deployment Issues**
   - SSH into server and check logs
   - Verify Docker containers status
   - Check application health endpoints

### Contacts

- **DevOps Team:** devops@example.com
- **Security Team:** security@example.com
- **Project Lead:** lead@example.com

---

## 📊 Success Metrics

Track these metrics to measure DevSecOps effectiveness:

### Security Metrics
- Number of vulnerabilities detected
- Time to remediate critical issues
- Security scan coverage
- False positive rate

### Performance Metrics
- Pipeline execution time
- Deployment frequency
- Mean time to recovery (MTTR)
- Change failure rate

### Quality Metrics
- Code coverage percentage
- Technical debt ratio
- Code duplication
- Test pass rate

---

## 🎯 Next Steps

1. **Configure all GitHub secrets** (GITHUB-SECRETS-SETUP.md)
2. **Setup security tool accounts** (SonarCloud, Snyk)
3. **Prepare EC2 production server**
4. **Push to main branch** to trigger pipeline
5. **Monitor execution** and review reports
6. **Address security findings**
7. **Setup monitoring alerts**
8. **Document any customizations**

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-13 | Initial DevSecOps pipeline setup |

---

**🚀 You're all set! Push to main branch to start your first DevSecOps pipeline run!**

---

*For detailed information, refer to the complete documentation files in this directory.*
