#!/bin/bash

# Install pre-commit hook
# This script copies the pre-commit hook to .git/hooks/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOK_SOURCE="$PROJECT_ROOT/scripts/pre-commit.sh"
HOOK_TARGET="$PROJECT_ROOT/.git/hooks/pre-commit"

if [ ! -f "$HOOK_SOURCE" ]; then
    echo "Error: pre-commit.sh not found at $HOOK_SOURCE"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT/.git/hooks" ]; then
    echo "Error: .git/hooks directory not found. Are you in a Git repository?"
    exit 1
fi

# Copy the hook
cp "$HOOK_SOURCE" "$HOOK_TARGET"
chmod +x "$HOOK_TARGET"

echo "✓ Pre-commit hook installed successfully!"
echo ""
echo "The hook will now run automatically on every commit."
echo "To test it, run: ./scripts/pre-commit.sh"
echo "To skip it once, use: git commit --no-verify"
