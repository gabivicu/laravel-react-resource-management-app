#!/bin/bash

# Script to install git push hook that displays commit link
# This adds a shell function to .zshrc that intercepts 'git push' commands

ZSH_RC="$HOME/.zshrc"
HOOK_FUNCTION='# Git push with commit link (added by install-git-push-hook.sh)
git() {
    if [ "$1" = "push" ]; then
        # Execute git push and capture output
        OUTPUT=$(command git push "$@" 2>&1)
        EXIT_CODE=$?
        echo "$OUTPUT"
        
        if [ $EXIT_CODE -eq 0 ]; then
            # Get remote URL
            REMOTE_URL=$(command git remote get-url origin 2>/dev/null || echo "")
            
            if [ ! -z "$REMOTE_URL" ]; then
                # Extract repo path
                if [[ "$REMOTE_URL" =~ git@github\.com:(.+)\.git$ ]]; then
                    REPO_PATH="${BASH_REMATCH[1]}"
                elif [[ "$REMOTE_URL" =~ https://github\.com/(.+)\.git$ ]]; then
                    REPO_PATH="${BASH_REMATCH[1]}"
                elif [[ "$REMOTE_URL" =~ https://github\.com/(.+)$ ]]; then
                    REPO_PATH="${BASH_REMATCH[1]}"
                fi
                
                if [ ! -z "$REPO_PATH" ]; then
                    LATEST_COMMIT=$(command git log -1 --format="%H" 2>/dev/null)
                    
                    if [ ! -z "$LATEST_COMMIT" ]; then
                        COMMIT_URL="https://github.com/${REPO_PATH}/commit/${LATEST_COMMIT}"
                        echo ""
                        echo -e "\033[0;32m✓ Push successful!\033[0m"
                        # OSC 8 hyperlink format for clickable links (works in iTerm2 and modern terminals)
                        printf "\033]8;;%s\033\\\033[0;34m📎 Commit link: %s\033]8;;\033\\\033[0m\n" "${COMMIT_URL}" "${COMMIT_URL}"
                        echo ""
                    fi
                fi
            fi
        fi
        
        return $EXIT_CODE
    else
        # For all other git commands, use the original git
        command git "$@"
    fi
}'

# Check if hook already exists
if grep -q "# Git push with commit link (added by install-git-push-hook.sh)" "$ZSH_RC" 2>/dev/null; then
    echo "Git push hook already installed in $ZSH_RC"
    echo "To reinstall, remove the existing hook first."
    exit 0
fi

# Add hook to .zshrc
echo "" >> "$ZSH_RC"
echo "$HOOK_FUNCTION" >> "$ZSH_RC"

echo "✓ Git push hook installed successfully!"
echo ""
echo "The hook has been added to $ZSH_RC"
echo "To activate it, run: source $ZSH_RC"
echo "Or open a new terminal window."
echo ""
echo "Now when you run 'git push', it will automatically display a clickable commit link!"
