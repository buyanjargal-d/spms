#!/bin/bash

# Script to add GitHub Secrets for SPMS deployment
# This script requires GitHub CLI (gh) to be installed and authenticated

set -e

echo "========================================="
echo "Adding GitHub Secrets for SPMS"
echo "========================================="

REPO="buyanjargal-d/spms"

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "To install GitHub CLI:"
    echo "Ubuntu/Debian: sudo apt install gh"
    echo "Or visit: https://cli.github.com/manual/installation"
    echo ""
    echo "After installation, run: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# EC2 Configuration
echo "📝 Adding EC2_HOST..."
echo "34.197.247.53" | gh secret set EC2_HOST --repo "$REPO"

echo "📝 Adding EC2_USERNAME..."
echo "ubuntu" | gh secret set EC2_USERNAME --repo "$REPO"

echo "📝 Adding EC2_SSH_KEY..."
cat /home/buyaka/Desktop/spms/spms-backend.pem | gh secret set EC2_SSH_KEY --repo "$REPO"

# Database Configuration
echo "📝 Adding DATABASE_URL..."
echo "postgresql://postgres.ypeushpkdsgekmlvcfwm:uqt1sU6QNVsyPYgd@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres" | gh secret set DATABASE_URL --repo "$REPO"

# JWT Secrets
echo "📝 Adding JWT_SECRET..."
echo "822be982fece7e9ac597eafbae0ee8bf1968ee10c1598c2012c4395cdec5d3d852ebd2e75152b1b14792771f902f528a434537fa218d60c4462df399ee0a65b4" | gh secret set JWT_SECRET --repo "$REPO"

echo "📝 Adding JWT_REFRESH_SECRET..."
echo "9bef7c6b81a10539e71ac899297b516d3c63d57e42562791215be05db9321599ff5674c0feca84b7af4bb45af87bd2dc31b705c054c5ad730e70f97e7b00588f" | gh secret set JWT_REFRESH_SECRET --repo "$REPO"

# Supabase Configuration
echo "📝 Adding SUPABASE_URL..."
echo "https://ypeushpkdsgekmlvcfwm.supabase.co" | gh secret set SUPABASE_URL --repo "$REPO"

echo "📝 Adding SUPABASE_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZXVzaHBrZHNnZWttbHZjZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDM5NDEsImV4cCI6MjA3NzAxOTk0MX0.TyWidx0T4oy50QZ15T-ZfSQ-jI7UEWl6-ukwhsv4oP8" | gh secret set SUPABASE_KEY --repo "$REPO"

echo ""
echo "========================================="
echo "✅ All GitHub Secrets Added Successfully!"
echo "========================================="
echo ""
echo "Secrets added:"
echo "  ✓ EC2_HOST"
echo "  ✓ EC2_USERNAME"
echo "  ✓ EC2_SSH_KEY"
echo "  ✓ DATABASE_URL"
echo "  ✓ JWT_SECRET"
echo "  ✓ JWT_REFRESH_SECRET"
echo "  ✓ SUPABASE_URL"
echo "  ✓ SUPABASE_KEY"
echo ""
echo "You can now push to 'developer' or 'main' branch to trigger deployment!"
echo ""
echo "To verify secrets:"
echo "  gh secret list --repo $REPO"
echo ""
