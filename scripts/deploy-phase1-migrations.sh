#!/bin/bash

################################################################################
# Phase 1 Migration Deployment Script
# Deploys all Phase 1 database migrations to Supabase
################################################################################

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════════"
echo "  SPMS - Phase 1 Database Migration Deployment"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load database URL from .env
if [ -f .env ]; then
    export $(cat .env | grep DATABASE_URL | xargs)
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Database connection found"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql is not installed${NC}"
    echo "Please install PostgreSQL client:"
    echo "  Ubuntu/Debian: sudo apt install postgresql-client"
    echo "  Mac: brew install postgresql"
    exit 1
fi

echo -e "${GREEN}✓${NC} psql found"
echo ""

# Confirm before proceeding
echo -e "${YELLOW}⚠️  WARNING: This will modify your database!${NC}"
echo ""
echo "Migrations to deploy:"
echo "  1. 008_create_notifications.sql"
echo "  2. 009_create_attendance.sql"
echo "  3. 010_create_school_settings.sql"
echo "  4. 011_alter_pickup_requests_add_columns.sql"
echo "  5. 012_alter_users_add_columns.sql"
echo "  6. 013_alter_students_add_columns.sql"
echo "  7. 014_alter_classes_add_columns.sql"
echo ""

read -p "Do you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

# Function to run migration
run_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file" .sql)

    echo -e "${BLUE}▶${NC} Running ${migration_name}..."

    if psql "$DATABASE_URL" -f "$migration_file" -v ON_ERROR_STOP=1; then
        echo -e "${GREEN}✓${NC} ${migration_name} completed successfully"
        echo ""
        return 0
    else
        echo -e "${RED}❌${NC} ${migration_name} failed"
        echo ""
        return 1
    fi
}

# Run all migrations
MIGRATIONS_DIR="backend/src/migrations"

echo "════════════════════════════════════════════════════════════════"
echo "  Deploying Phase 1 Migrations"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Migration 008
if ! run_migration "$MIGRATIONS_DIR/008_create_notifications.sql"; then
    echo -e "${RED}Deployment stopped due to error${NC}"
    exit 1
fi

# Migration 009
if ! run_migration "$MIGRATIONS_DIR/009_create_attendance.sql"; then
    echo -e "${RED}Deployment stopped due to error${NC}"
    exit 1
fi

# Migration 010
if ! run_migration "$MIGRATIONS_DIR/010_create_school_settings.sql"; then
    echo -e "${RED}Deployment stopped due to error${NC}"
    exit 1
fi

# Migration 011
if ! run_migration "$MIGRATIONS_DIR/011_alter_pickup_requests_add_columns.sql"; then
    echo -e "${RED}Deployment stopped due to error${NC}"
    exit 1
fi

# Migration 012
if ! run_migration "$MIGRATIONS_DIR/012_alter_users_add_columns.sql"; then
    echo -e "${RED}Deployment stopped due to error${NC}"
    exit 1
fi

# Migration 013
if ! run_migration "$MIGRATIONS_DIR/013_alter_students_add_columns.sql"; then
    echo -e "${RED}Deployment stopped due to error${NC}"
    exit 1
fi

# Migration 014
if ! run_migration "$MIGRATIONS_DIR/014_alter_classes_add_columns.sql"; then
    echo -e "${RED}Deployment stopped due to error${NC}"
    exit 1
fi

echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ ALL PHASE 1 MIGRATIONS DEPLOYED SUCCESSFULLY!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Run verification queries
echo "Running verification checks..."
echo ""

echo -e "${BLUE}Checking new tables...${NC}"
psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('notifications', 'attendance', 'school_settings') ORDER BY table_name;" -t

echo ""
echo -e "${BLUE}Checking school settings...${NC}"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as settings_count FROM school_settings;" -t

echo ""
echo -e "${BLUE}Checking new functions...${NC}"
psql "$DATABASE_URL" -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('generate_qr_code', 'generate_verification_pin', 'record_login_attempt') ORDER BY routine_name;" -t

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Phase 1 Deployment Complete!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Create TypeORM models for new tables"
echo "  2. Create API endpoints"
echo "  3. Update frontend"
echo "  4. Deploy Phase 2 migrations"
echo ""
echo "See plan/PHASE1_SUMMARY.txt for details"
echo ""
