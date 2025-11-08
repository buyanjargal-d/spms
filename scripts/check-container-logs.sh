#!/bin/bash

# Container Logs Analysis Script
# Run this on EC2 to diagnose frontend/backend communication

echo "========================================="
echo "SPMS Container Logs Analysis"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}1. Checking container status...${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo -e "${YELLOW}2. Backend logs (last 50 lines)...${NC}"
echo -e "${BLUE}Looking for API requests and database queries...${NC}"
docker logs spms-backend --tail=50 2>&1 | grep -E "GET|POST|PUT|DELETE|SELECT|ERROR|Database|Connection"
echo ""

echo -e "${YELLOW}3. Frontend logs (last 30 lines)...${NC}"
docker logs spms-frontend --tail=30
echo ""

echo -e "${YELLOW}4. Backend: Check what API URL frontend is using...${NC}"
echo "Rebuild information from frontend container:"
docker inspect spms-frontend | grep -i "vite_api" || echo "No VITE_API_URL found in inspect"
echo ""

echo -e "${YELLOW}5. Backend: Recent API requests...${NC}"
docker logs spms-backend --tail=100 2>&1 | grep -E "GET /api/v1" | tail -20
echo ""

echo -e "${YELLOW}6. Backend: Database queries...${NC}"
docker logs spms-backend --tail=100 2>&1 | grep -i "select" | tail -10
echo ""

echo -e "${YELLOW}7. Backend: Check students endpoint specifically...${NC}"
docker logs spms-backend 2>&1 | grep -i "student" | tail -20
echo ""

echo -e "${YELLOW}8. Test API endpoint directly from EC2...${NC}"
echo "Testing GET /api/v1/students:"
RESPONSE=$(curl -s http://localhost:3000/api/v1/students)
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

echo -e "${YELLOW}9. Check frontend build - API URL in compiled code...${NC}"
echo "Checking if frontend has correct API URL compiled in:"
docker exec spms-frontend grep -r "3.94.130.22" /usr/share/nginx/html/ 2>/dev/null | head -5 || \
docker exec spms-frontend grep -r "localhost:3000" /usr/share/nginx/html/ 2>/dev/null | head -5
echo ""

echo "========================================="
echo -e "${BLUE}Analysis Complete${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Check if frontend logs show API requests"
echo "2. Verify backend logs show incoming requests"
echo "3. Check if API URL in frontend build is correct (should be 3.94.130.22)"
echo "4. If API URL is still localhost, rebuild frontend with correct env var"
echo ""
