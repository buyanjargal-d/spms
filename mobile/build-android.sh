#!/bin/bash

# SPMS Mobile - Android Build Helper Script
# This script helps you build and test the Android app easily

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║        SPMS Mobile - Android Build Helper             ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to display menu
show_menu() {
    echo -e "${GREEN}Choose your build option:${NC}"
    echo ""
    echo "  1) Preview Build (Quick testing, standalone APK)"
    echo "  2) Development Build (Hot reload, debugging)"
    echo "  3) List Recent Builds"
    echo "  4) Download Latest Build"
    echo "  5) Check Configuration"
    echo "  6) Install APK via USB"
    echo "  7) Start Dev Server (for development builds)"
    echo "  8) Get Computer IP (for API configuration)"
    echo "  9) Test Backend Connection"
    echo "  0) Exit"
    echo ""
}

# Function to check configuration
check_config() {
    echo -e "${BLUE}📋 Checking Configuration...${NC}"
    echo ""

    # Check if eas.json exists
    if [ -f "eas.json" ]; then
        echo -e "${GREEN}✓ eas.json found${NC}"
    else
        echo -e "${RED}✗ eas.json not found${NC}"
    fi

    # Check if app.json exists
    if [ -f "app.json" ]; then
        echo -e "${GREEN}✓ app.json found${NC}"

        # Extract API URL
        API_URL=$(grep -A 1 '"apiUrl"' app.json | grep -o 'http[^"]*')
        echo -e "${YELLOW}  Current API URL: ${API_URL}${NC}"
    else
        echo -e "${RED}✗ app.json not found${NC}"
    fi

    # Check if EAS CLI is installed
    if command -v eas &> /dev/null; then
        echo -e "${GREEN}✓ EAS CLI installed${NC}"
        eas --version
    else
        echo -e "${RED}✗ EAS CLI not installed${NC}"
        echo "  Install with: npm install -g eas-cli"
    fi

    # Check if logged into EAS
    if eas whoami &> /dev/null; then
        echo -e "${GREEN}✓ Logged into EAS${NC}"
        eas whoami
    else
        echo -e "${YELLOW}⚠ Not logged into EAS${NC}"
        echo "  Login with: eas login"
    fi

    echo ""
}

# Function to get computer IP
get_ip() {
    echo -e "${BLUE}🌐 Your Computer IP Address:${NC}"
    IP=$(hostname -I | awk '{print $1}')
    echo -e "${GREEN}${IP}${NC}"
    echo ""
    echo "Use this IP in your app.json:"
    echo -e "${YELLOW}http://${IP}:3000/api/v1${NC}"
    echo ""
}

# Function to test backend
test_backend() {
    echo -e "${BLUE}🔍 Testing Backend Connection...${NC}"

    # Get API URL from app.json
    API_URL=$(grep -A 1 '"apiUrl"' app.json | grep -o 'http[^"]*' | head -1)

    if [ -z "$API_URL" ]; then
        echo -e "${RED}✗ Could not find API URL in app.json${NC}"
        return
    fi

    echo "Testing: ${API_URL}"
    echo ""

    # Test local backend
    echo "Testing localhost:3000..."
    if curl -s http://localhost:3000/api/v1/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is running on localhost${NC}"
    else
        echo -e "${RED}✗ Backend not responding on localhost${NC}"
        echo "  Start with: cd ../backend && npm run dev"
    fi

    # Test network backend
    echo ""
    echo "Testing network URL: ${API_URL}/health"
    if curl -s -m 5 "${API_URL}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is accessible from network${NC}"
    else
        echo -e "${RED}✗ Backend not accessible from network${NC}"
        echo "  1. Make sure backend is running"
        echo "  2. Check firewall: sudo ufw allow 3000"
        echo "  3. Update IP in app.json if changed"
    fi

    echo ""
}

# Function to build preview
build_preview() {
    echo -e "${BLUE}🔨 Building Preview APK...${NC}"
    echo ""
    echo "This will take ~10-15 minutes."
    echo "You can close terminal and check build status later at:"
    echo "https://expo.dev/accounts/bbka/projects/spms-mobile/builds"
    echo ""

    eas build --profile preview --platform android
}

# Function to build development
build_development() {
    echo -e "${BLUE}🔨 Building Development APK...${NC}"
    echo ""
    echo "This will take ~10-15 minutes."
    echo "After installation, you'll need to run: npx expo start --dev-client"
    echo ""

    eas build --profile development --platform android
}

# Function to list builds
list_builds() {
    echo -e "${BLUE}📋 Recent Builds:${NC}"
    echo ""
    eas build:list --platform android --limit 5
}

# Function to download latest build
download_build() {
    echo -e "${BLUE}⬇️  Downloading Latest Build...${NC}"
    echo ""
    eas build:download --platform android --latest
    echo ""
    echo -e "${GREEN}✓ Download complete${NC}"
    echo ""
    echo "To install via USB:"
    echo "  1. Connect Android device"
    echo "  2. Enable USB debugging"
    echo "  3. Run: adb install *.apk"
}

# Function to install via USB
install_usb() {
    echo -e "${BLUE}📱 Installing APK via USB...${NC}"
    echo ""

    # Check if adb is available
    if ! command -v adb &> /dev/null; then
        echo -e "${RED}✗ adb not found${NC}"
        echo "Install with: sudo apt install android-tools-adb"
        return
    fi

    # Check for devices
    echo "Checking for connected devices..."
    adb devices
    echo ""

    # Find APK file
    APK=$(ls -t *.apk 2>/dev/null | head -1)

    if [ -z "$APK" ]; then
        echo -e "${RED}✗ No APK file found in current directory${NC}"
        echo "Download build first (option 4)"
        return
    fi

    echo "Found APK: ${APK}"
    echo "Installing..."

    adb install "$APK"

    echo ""
    echo -e "${GREEN}✓ Installation complete${NC}"
}

# Function to start dev server
start_dev_server() {
    echo -e "${BLUE}🚀 Starting Development Server...${NC}"
    echo ""
    echo "Make sure you have:"
    echo "  1. Installed development build APK on your phone"
    echo "  2. Backend server running (npm run dev in backend/)"
    echo ""
    echo "Once started, scan the QR code with your development app"
    echo ""

    read -p "Press Enter to continue or Ctrl+C to cancel..."

    npx expo start --dev-client
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice [0-9]: " choice

    case $choice in
        1)
            build_preview
            ;;
        2)
            build_development
            ;;
        3)
            list_builds
            ;;
        4)
            download_build
            ;;
        5)
            check_config
            ;;
        6)
            install_usb
            ;;
        7)
            start_dev_server
            ;;
        8)
            get_ip
            ;;
        9)
            test_backend
            ;;
        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac

    echo ""
    read -p "Press Enter to continue..."
    clear
done
