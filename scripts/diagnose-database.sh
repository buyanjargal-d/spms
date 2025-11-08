#!/bin/bash

# Database Connection Diagnostic Script
# Run this on EC2 to diagnose database connection issues

echo "========================================="
echo "SPMS Database Connection Diagnostics"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}1. Checking backend container status...${NC}"
if docker ps | grep -q spms-backend; then
    echo -e "${GREEN}✓ Backend container is running${NC}"
else
    echo -e "${RED}✗ Backend container is NOT running${NC}"
    echo "Run: docker compose up -d"
    exit 1
fi
echo ""

echo -e "${YELLOW}2. Checking DATABASE_URL environment variable...${NC}"
DB_URL=$(docker exec spms-backend printenv DATABASE_URL 2>/dev/null)
if [ -z "$DB_URL" ]; then
    echo -e "${RED}✗ DATABASE_URL is not set!${NC}"
    echo "Check backend/.env file"
    exit 1
else
    echo -e "${GREEN}✓ DATABASE_URL is set${NC}"
    # Extract and show connection info (hiding password)
    if [[ $DB_URL =~ postgres://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
        echo -e "${BLUE}  User: ${BASH_REMATCH[1]}${NC}"
        echo -e "${BLUE}  Host: ${BASH_REMATCH[3]}${NC}"
        echo -e "${BLUE}  Port: ${BASH_REMATCH[4]}${NC}"
        echo -e "${BLUE}  Database: ${BASH_REMATCH[5]}${NC}"
        echo -e "${BLUE}  Password: [HIDDEN]${NC}"
    fi
fi
echo ""

echo -e "${YELLOW}3. Checking if database connection is active in logs...${NC}"
if docker logs spms-backend 2>&1 | grep -q "Database connection established"; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
    docker logs spms-backend 2>&1 | grep "Database connection" | tail -1
else
    echo -e "${RED}✗ No database connection confirmation found${NC}"
    echo "Recent backend logs:"
    docker logs spms-backend --tail=20 2>&1
fi
echo ""

echo -e "${YELLOW}4. Testing backend health endpoint...${NC}"
HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
    echo "Response: $HEALTH"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi
echo ""

echo -e "${YELLOW}5. Checking backend .env file...${NC}"
if [ -f ~/spms/backend/.env ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    echo "Contents (passwords hidden):"
    cat ~/spms/backend/.env | sed 's/\(DATABASE_URL=postgres:\/\/[^:]*:\)[^@]*/\1[HIDDEN]/' | \
        sed 's/\(JWT_SECRET=\).*/\1[HIDDEN]/' | \
        sed 's/\(JWT_REFRESH_SECRET=\).*/\1[HIDDEN]/' | \
        sed 's/\(SUPABASE_KEY=\).*/\1[HIDDEN]/'
else
    echo -e "${RED}✗ .env file not found${NC}"
fi
echo ""

echo -e "${YELLOW}6. Checking Supabase connection variables...${NC}"
SUPABASE_URL=$(docker exec spms-backend printenv SUPABASE_URL 2>/dev/null)
SUPABASE_KEY=$(docker exec spms-backend printenv SUPABASE_KEY 2>/dev/null)

if [ -n "$SUPABASE_URL" ]; then
    echo -e "${GREEN}✓ SUPABASE_URL is set${NC}"
    echo -e "${BLUE}  URL: $SUPABASE_URL${NC}"
else
    echo -e "${RED}✗ SUPABASE_URL is not set${NC}"
fi

if [ -n "$SUPABASE_KEY" ]; then
    echo -e "${GREEN}✓ SUPABASE_KEY is set (hidden)${NC}"
else
    echo -e "${RED}✗ SUPABASE_KEY is not set${NC}"
fi
echo ""

echo -e "${YELLOW}7. Testing API endpoint (requires authentication)...${NC}"
echo "Try accessing: http://$(curl -s ifconfig.me):3000/api/v1/health"
echo "Or from your browser: http://$(curl -s ifconfig.me):3000/"
echo ""

echo "========================================="
echo -e "${BLUE}Diagnostic Summary${NC}"
echo "========================================="
echo ""
echo "Next steps to verify database data:"
echo "1. Login to your application frontend"
echo "2. Check if you can see the new data you added to Supabase"
echo "3. If not, check Supabase Dashboard to confirm data is there"
echo "4. Run a test query in Supabase SQL Editor:"
echo "   SELECT * FROM users LIMIT 5;"
echo ""
echo "If DATABASE_URL is different from your Supabase project:"
echo "1. Update GitHub Secret: DATABASE_URL"
echo "2. Or manually edit: ~/spms/backend/.env"
echo "3. Restart: cd ~/spms && docker compose restart backend"
echo ""
