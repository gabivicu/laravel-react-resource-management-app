#!/bin/bash

# Execute git push
git push "$@"

# If push succeeded
if [ $? -eq 0 ]; then
    # Get remote URL
    REMOTE_URL=$(git remote get-url origin 2>/dev/null)
    
    # Parse repo path
    if [[ "$REMOTE_URL" =~ git@github\.com:(.+)\.git$ ]]; then
        REPO_PATH="${BASH_REMATCH[1]}"
    elif [[ "$REMOTE_URL" =~ https://github\.com/(.+)\.git$ ]]; then
        REPO_PATH="${BASH_REMATCH[1]}"
    fi

    # Get commit hash
    COMMIT_HASH=$(git log -1 --format="%H")
    
    # Construct URL
    URL="https://github.com/${REPO_PATH}/commit/${COMMIT_HASH}"
    
    # Print clickable link (OSC 8)
    echo ""
    echo -e "\033[0;32m✓ Push successful!\033[0m"
    printf "\e]8;;%s\e\\%s\e]8;;\e\\\n" "$URL" "🔗 Click here to view commit on GitHub"
    echo -e "\033[0;34m$URL\033[0m"
    echo ""
fi
