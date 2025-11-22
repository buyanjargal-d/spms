#!/bin/bash

# SPMS Database Setup Script
# Runs all migrations and seeds test data

set -e  # Exit on error

echo "SPMS Database Setup"
echo "====================="
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MIGRATIONS_DIR="$SCRIPT_DIR/../src/migrations"
BACKEND_DIR="$SCRIPT_DIR/.."

# Load environment variables
if [ -f "$BACKEND_DIR/.env" ]; then
    export $(cat "$BACKEND_DIR/.env" | grep -v '^#' | xargs)
    echo "Environment variables loaded"
else
    echo "ERROR: .env file not found in $BACKEND_DIR"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set in .env file"
    exit 1
fi

echo "Database: $(echo $DATABASE_URL | sed 's/:[^:@]*@/:****@/')"
echo ""

# Function to run SQL migration
run_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")

    echo "Running migration: $migration_name"

    PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') \
    psql "$DATABASE_URL" -f "$migration_file" -v ON_ERROR_STOP=1

    if [ $? -eq 0 ]; then
        echo "Migration $migration_name completed"
    else
        echo "ERROR: Migration $migration_name failed"
        exit 1
    fi
    echo ""
}

# Ask user what to do
echo "What would you like to do?"
echo "1) Run all migrations only"
echo "2) Run all migrations and seed test data"
echo "3) Seed test data only (skip migrations)"
echo "4) Run specific migration"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Running all migrations..."
        echo ""

        # Run migrations in order
        run_migration "$MIGRATIONS_DIR/001_add_guest_pickup_approvals.sql"
        run_migration "$MIGRATIONS_DIR/002_update_pickup_status_constraint.sql"
        run_migration "$MIGRATIONS_DIR/003_create_audit_logs.sql"
        run_migration "$MIGRATIONS_DIR/004_update_audit_logs.sql"
        run_migration "$MIGRATIONS_DIR/005_fix_enum_types.sql"
        run_migration "$MIGRATIONS_DIR/006_add_indexes.sql"
        run_migration "$MIGRATIONS_DIR/007_add_updated_at_triggers.sql"

        echo "All migrations completed successfully!"
        ;;

    2)
        echo ""
        echo "Running all migrations..."
        echo ""

        # Run migrations in order
        run_migration "$MIGRATIONS_DIR/001_add_guest_pickup_approvals.sql"
        run_migration "$MIGRATIONS_DIR/002_update_pickup_status_constraint.sql"
        run_migration "$MIGRATIONS_DIR/003_create_audit_logs.sql"
        run_migration "$MIGRATIONS_DIR/004_update_audit_logs.sql"
        run_migration "$MIGRATIONS_DIR/005_fix_enum_types.sql"
        run_migration "$MIGRATIONS_DIR/006_add_indexes.sql"
        run_migration "$MIGRATIONS_DIR/007_add_updated_at_triggers.sql"

        echo "All migrations completed!"
        echo ""
        echo "Seeding test data..."
        echo ""

        cd "$BACKEND_DIR"
        node "$SCRIPT_DIR/seed-database.js"

        echo ""
        echo "✅ Database setup completed successfully!"
        ;;

    3)
        echo ""
        echo "Seeding test data..."
        echo ""

        cd "$BACKEND_DIR"
        node "$SCRIPT_DIR/seed-database.js"

        echo ""
        echo "✅ Test data seeded successfully!"
        ;;

    4)
        echo ""
        echo "Available migrations:"
        ls -1 "$MIGRATIONS_DIR"/*.sql | nl
        echo ""
        read -p "Enter migration number: " migration_num

        migration_file=$(ls -1 "$MIGRATIONS_DIR"/*.sql | sed -n "${migration_num}p")

        if [ -z "$migration_file" ]; then
            echo "ERROR: Invalid migration number"
            exit 1
        fi

        run_migration "$migration_file"
        ;;

    *)
        echo "ERROR: Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Done!"
