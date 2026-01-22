#!/bin/bash

# Pre-commit script that can be run manually or as a Git hook
# Usage: ./scripts/pre-commit.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Running Pre-Commit Code Checks      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in Docker environment
if [ -f "docker-compose.yml" ] && command -v docker-compose &> /dev/null; then
    USE_DOCKER=true
    echo -e "${GREEN}✓ Docker environment detected${NC}"
else
    USE_DOCKER=false
    echo -e "${YELLOW}⚠ Local environment detected${NC}"
fi

ERRORS=0

# PHP Code Style Check (Laravel Pint)
echo -e "\n${YELLOW}[1/3] Checking PHP code style with Laravel Pint...${NC}"
if [ "$USE_DOCKER" = true ]; then
    if docker-compose exec -T app ./vendor/bin/pint --test 2>&1 | tail -1 | grep -q "PASS"; then
        echo -e "${GREEN}✓ PHP code style check passed${NC}"
    else
        echo -e "${RED}✗ PHP code style check failed${NC}"
        echo -e "${YELLOW}  Fix with: docker-compose exec app ./vendor/bin/pint${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    if [ -f "vendor/bin/pint" ]; then
        if ./vendor/bin/pint --test 2>&1 | tail -1 | grep -q "PASS"; then
            echo -e "${GREEN}✓ PHP code style check passed${NC}"
        else
            echo -e "${RED}✗ PHP code style check failed${NC}"
            echo -e "${YELLOW}  Fix with: ./vendor/bin/pint${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "${YELLOW}⚠ Laravel Pint not found. Skipping PHP style check.${NC}"
    fi
fi

# TypeScript Type Check
echo -e "\n${YELLOW}[2/3] Checking TypeScript types...${NC}"
if [ "$USE_DOCKER" = true ]; then
    if docker-compose exec -T node npm run type-check > /dev/null 2>&1; then
        echo -e "${GREEN}✓ TypeScript type check passed${NC}"
    else
        echo -e "${RED}✗ TypeScript type check failed${NC}"
        echo -e "${YELLOW}  Check errors: docker-compose exec node npm run type-check${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    if command -v npm &> /dev/null; then
        if npm run type-check > /dev/null 2>&1; then
            echo -e "${GREEN}✓ TypeScript type check passed${NC}"
        else
            echo -e "${RED}✗ TypeScript type check failed${NC}"
            echo -e "${YELLOW}  Check errors: npm run type-check${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "${YELLOW}⚠ npm not found. Skipping TypeScript check.${NC}"
    fi
fi

# ESLint Check
echo -e "\n${YELLOW}[3/3] Checking code with ESLint...${NC}"
if [ "$USE_DOCKER" = true ]; then
    if docker-compose exec -T node npm run lint > /dev/null 2>&1; then
        echo -e "${GREEN}✓ ESLint check passed${NC}"
    else
        echo -e "${RED}✗ ESLint check failed${NC}"
        echo -e "${YELLOW}  Fix with: docker-compose exec node npm run lint:fix${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    if command -v npm &> /dev/null; then
        if npm run lint > /dev/null 2>&1; then
            echo -e "${GREEN}✓ ESLint check passed${NC}"
        else
            echo -e "${RED}✗ ESLint check failed${NC}"
            echo -e "${YELLOW}  Fix with: npm run lint:fix${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "${YELLOW}⚠ npm not found. Skipping ESLint check.${NC}"
    fi
fi

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${BLUE}║${GREEN}  ✓ All checks passed! Ready to commit.${BLUE}  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${BLUE}║${RED}  ✗ ${ERRORS} check(s) failed. Fix errors first.${BLUE}  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    exit 1
fi
