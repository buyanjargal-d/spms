#!/bin/bash

# ========================================
# SPMS Local Development Helper Script
# ========================================
# Quick commands for local development

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Function to display menu
show_menu() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}SPMS Local Development Menu${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "1. ${GREEN}Start all services (Docker)${NC}"
    echo -e "2. ${GREEN}Stop all services${NC}"
    echo -e "3. ${GREEN}View logs${NC}"
    echo -e "4. ${GREEN}Restart services${NC}"
    echo -e "5. ${GREEN}Build frontend${NC}"
    echo -e "6. ${GREEN}Build backend${NC}"
    echo -e "7. ${GREEN}Clean up Docker resources${NC}"
    echo -e "8. ${GREEN}Run backend tests${NC}"
    echo -e "9. ${GREEN}Check service status${NC}"
    echo -e "10. ${GREEN}Open shell in backend container${NC}"
    echo -e "11. ${GREEN}Open shell in frontend container${NC}"
    echo -e "12. ${GREEN}View database logs${NC}"
    echo -e "13. ${GREEN}Seed demo data${NC}"
    echo -e "0. ${YELLOW}Exit${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Start services
start_services() {
    echo -e "${YELLOW}Starting all services...${NC}"
    docker compose up -d
    echo -e "${GREEN}✓ Services started${NC}"
    echo -e "\nAccess URLs:"
    echo -e "Frontend: ${GREEN}http://localhost${NC}"
    echo -e "Backend API: ${GREEN}http://localhost:3000${NC}"
    echo -e "Health Check: ${GREEN}http://localhost:3000/health${NC}"
}

# Stop services
stop_services() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    docker compose down
    echo -e "${GREEN}✓ Services stopped${NC}"
}

# View logs
view_logs() {
    echo -e "${YELLOW}Which service logs?${NC}"
    echo -e "1. All services"
    echo -e "2. Backend only"
    echo -e "3. Frontend only"
    echo -e "4. Database only"
    echo -e "5. Redis only"
    read -p "Choice: " log_choice

    case $log_choice in
        1) docker compose logs -f ;;
        2) docker compose logs -f backend ;;
        3) docker compose logs -f frontend ;;
        4) docker compose logs -f postgres ;;
        5) docker compose logs -f redis ;;
        *) echo "Invalid choice" ;;
    esac
}

# Restart services
restart_services() {
    echo -e "${YELLOW}Restarting services...${NC}"
    docker compose restart
    echo -e "${GREEN}✓ Services restarted${NC}"
}

# Build frontend
build_frontend() {
    echo -e "${YELLOW}Building frontend...${NC}"
    docker compose up -d --build frontend
    echo -e "${GREEN}✓ Frontend rebuilt${NC}"
}

# Build backend
build_backend() {
    echo -e "${YELLOW}Building backend...${NC}"
    docker compose up -d --build backend
    echo -e "${GREEN}✓ Backend rebuilt${NC}"
}

# Clean up
cleanup() {
    echo -e "${YELLOW}Cleaning up Docker resources...${NC}"
    docker compose down
    docker system prune -f
    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

# Run tests
run_tests() {
    echo -e "${YELLOW}Running backend tests...${NC}"
    docker compose exec backend npm test
}

# Check status
check_status() {
    echo -e "${YELLOW}Service Status:${NC}"
    docker compose ps
    echo -e "\n${YELLOW}Resource Usage:${NC}"
    docker stats --no-stream
}

# Backend shell
backend_shell() {
    echo -e "${YELLOW}Opening backend shell...${NC}"
    docker compose exec backend sh
}

# Frontend shell
frontend_shell() {
    echo -e "${YELLOW}Opening frontend shell...${NC}"
    docker compose exec frontend sh
}

# Database logs
database_logs() {
    echo -e "${YELLOW}Database logs:${NC}"
    docker compose logs -f postgres
}

# Seed demo data
seed_data() {
    echo -e "${YELLOW}Seeding demo data...${NC}"
    docker compose exec backend npm run seed:demo
    echo -e "${GREEN}✓ Demo data seeded${NC}"
}

# Main loop
while true; do
    show_menu
    read -p "Enter choice: " choice

    case $choice in
        1) start_services ;;
        2) stop_services ;;
        3) view_logs ;;
        4) restart_services ;;
        5) build_frontend ;;
        6) build_backend ;;
        7) cleanup ;;
        8) run_tests ;;
        9) check_status ;;
        10) backend_shell ;;
        11) frontend_shell ;;
        12) database_logs ;;
        13) seed_data ;;
        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${YELLOW}Invalid choice. Please try again.${NC}"
            ;;
    esac

    echo -e "\n${YELLOW}Press Enter to continue...${NC}"
    read
    clear
done
