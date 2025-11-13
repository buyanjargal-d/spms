#!/bin/bash

# ========================================
# SSL/TLS Certificate Setup Script
# ========================================
# This script sets up Let's Encrypt SSL certificates for SPMS
# Usage: ./setup-ssl.sh <domain-name> <email>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root or with sudo${NC}"
  exit 1
fi

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 <domain-name> <email>${NC}"
    echo -e "${YELLOW}Example: $0 spms.example.com admin@example.com${NC}"
    exit 1
fi

DOMAIN="$1"
EMAIL="$2"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SSL_DIR="$PROJECT_DIR/nginx/ssl"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SSL Certificate Setup for SPMS${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Domain: ${GREEN}$DOMAIN${NC}"
echo -e "Email: ${GREEN}$EMAIL${NC}"
echo -e "SSL Directory: ${GREEN}$SSL_DIR${NC}"
echo -e "${BLUE}========================================${NC}"

# Install certbot if not already installed
echo -e "\n${YELLOW}Installing Certbot...${NC}"
if command -v apt-get &> /dev/null; then
    apt-get update -qq
    apt-get install -y certbot python3-certbot-nginx
elif command -v yum &> /dev/null; then
    yum install -y certbot python3-certbot-nginx
else
    echo -e "${RED}Unsupported package manager${NC}"
    exit 1
fi

# Create SSL directory
echo -e "\n${YELLOW}Creating SSL directory...${NC}"
mkdir -p "$SSL_DIR"

# Stop nginx if running in Docker
echo -e "\n${YELLOW}Stopping Docker containers temporarily...${NC}"
cd "$PROJECT_DIR"
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Obtain certificate
echo -e "\n${YELLOW}Obtaining SSL certificate from Let's Encrypt...${NC}"
certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --domains "$DOMAIN" \
    --keep-until-expiring

# Copy certificates to project SSL directory
echo -e "\n${YELLOW}Copying certificates to project directory...${NC}"
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem "$SSL_DIR/"
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem "$SSL_DIR/"
chmod 644 "$SSL_DIR/fullchain.pem"
chmod 600 "$SSL_DIR/privkey.pem"

# Create renewal hook
echo -e "\n${YELLOW}Setting up certificate renewal hook...${NC}"
cat > /etc/letsencrypt/renewal-hooks/deploy/spms-renewal.sh << 'RENEWAL_SCRIPT'
#!/bin/bash
# SPMS Certificate Renewal Hook

DOMAIN="$RENEWED_DOMAINS"
PROJECT_DIR="__PROJECT_DIR__"
SSL_DIR="$PROJECT_DIR/nginx/ssl"

# Copy renewed certificates
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem "$SSL_DIR/"
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem "$SSL_DIR/"
chmod 644 "$SSL_DIR/fullchain.pem"
chmod 600 "$SSL_DIR/privkey.pem"

# Reload nginx in Docker
cd "$PROJECT_DIR"
docker compose -f docker-compose.prod.yml exec -T frontend nginx -s reload

echo "SSL certificates renewed and nginx reloaded"
RENEWAL_SCRIPT

# Replace placeholder with actual project directory
sed -i "s|__PROJECT_DIR__|$PROJECT_DIR|g" /etc/letsencrypt/renewal-hooks/deploy/spms-renewal.sh
chmod +x /etc/letsencrypt/renewal-hooks/deploy/spms-renewal.sh

# Set up automatic renewal
echo -e "\n${YELLOW}Setting up automatic certificate renewal...${NC}"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 3 * * * certbot renew --quiet") | crontab -

# Update nginx configuration to enable HTTPS
echo -e "\n${YELLOW}Updating nginx configuration for HTTPS...${NC}"
NGINX_CONF="$PROJECT_DIR/frontend/nginx.conf"

# Uncomment HTTPS server block
sed -i 's/^# \(server {\)/\1/g' "$NGINX_CONF"
sed -i 's/^#     \(.*\)/    \1/g' "$NGINX_CONF"

# Comment out HTTP to HTTPS redirect
sed -i 's/^    # \(return 301 https\)/    \1/g' "$NGINX_CONF"

# Update server_name
sed -i "s/server_name _;/server_name $DOMAIN;/g" "$NGINX_CONF"

# Restart containers with HTTPS enabled
echo -e "\n${YELLOW}Restarting Docker containers with HTTPS enabled...${NC}"
docker compose -f docker-compose.prod.yml up -d --build

# Test SSL configuration
echo -e "\n${YELLOW}Testing SSL configuration...${NC}"
sleep 5
if curl -f https://$DOMAIN/health &>/dev/null; then
    echo -e "${GREEN}✓ HTTPS is working correctly!${NC}"
else
    echo -e "${YELLOW}⚠ HTTPS health check failed. Please verify manually.${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}SSL Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Important Information:${NC}"
echo -e "• SSL certificates installed for: ${GREEN}$DOMAIN${NC}"
echo -e "• Certificates location: ${GREEN}$SSL_DIR${NC}"
echo -e "• Auto-renewal configured via cron"
echo -e "• Certificates will auto-renew before expiration"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Verify HTTPS is working: ${GREEN}https://$DOMAIN${NC}"
echo -e "2. Update ALLOWED_ORIGINS in .env to include https://$DOMAIN"
echo -e "3. Test certificate renewal: ${GREEN}certbot renew --dry-run${NC}"
echo -e "\n${YELLOW}Certificate Renewal:${NC}"
echo -e "• Automatic renewal runs daily at 3 AM"
echo -e "• Manual renewal: ${GREEN}certbot renew${NC}"
echo -e "• Check certificate expiry: ${GREEN}certbot certificates${NC}"
echo -e "${GREEN}========================================${NC}"
