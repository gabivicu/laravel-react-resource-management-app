#!/bin/bash

# Git push wrapper that displays GitHub commit link after push
# Usage: ./scripts/git-push-with-link.sh [git push arguments]

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Execute git push with all arguments
git push "$@"

# Check if push was successful
if [ $? -eq 0 ]; then
    # Get the remote URL
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    
    if [ ! -z "$REMOTE_URL" ]; then
        # Extract repository path from remote URL
        # Handle both SSH (git@github.com:user/repo.git) and HTTPS (https://github.com/user/repo.git) formats
        if [[ "$REMOTE_URL" =~ git@github\.com:(.+)\.git$ ]]; then
            REPO_PATH="${BASH_REMATCH[1]}"
        elif [[ "$REMOTE_URL" =~ https://github\.com/(.+)\.git$ ]]; then
            REPO_PATH="${BASH_REMATCH[1]}"
        elif [[ "$REMOTE_URL" =~ https://github\.com/(.+)$ ]]; then
            REPO_PATH="${BASH_REMATCH[1]}"
        fi
        
        if [ ! -z "$REPO_PATH" ]; then
            # Get the latest commit hash
            LATEST_COMMIT=$(git log -1 --format="%H" 2>/dev/null || echo "")
            
            if [ ! -z "$LATEST_COMMIT" ]; then
                # Construct GitHub commit URL
                COMMIT_URL="https://github.com/${REPO_PATH}/commit/${LATEST_COMMIT}"
                
                # Display the link (using OSC 8 for clickable links in modern terminals)
                echo ""
                echo -e "${GREEN}✓ Push successful!${NC}"
                # Try to create clickable link (OSC 8 format for iTerm2 and modern terminals)
                # Format: \033]8;;URL\033\\TEXT\033]8;;\033\\
                printf "\033]8;;%s\033\\%s📎 Commit link: %s\033]8;;\033\\%s\n" "${COMMIT_URL}" "${BLUE}" "${COMMIT_URL}" "${NC}"
                echo ""
                echo "   (Click the link above or copy it)"
                echo ""
            fi
        fi
    fi
fi
