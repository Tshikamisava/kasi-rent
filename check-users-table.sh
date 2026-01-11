#!/bin/bash

# Check Users Table Bash Script
# This script runs the check-users-table.js utility to verify the users table structure

echo "🔍 Checking Users Table Structure"
echo "================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER_DIR="$SCRIPT_DIR/server"

# Navigate to server directory
cd "$SERVER_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run the check script
echo "Running check-users-table.js..."
echo ""
node check-users-table.js

# Return to original directory
cd "$SCRIPT_DIR"
