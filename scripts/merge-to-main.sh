#!/bin/bash
set -e

# --- Function: gradient_echo_rgb ---
gradient_echo_rgb() {
    local text="$1"
    local R1=$2 G1=$3 B1=$4
    local R2=$5 G2=$6 B2=$7
    local len=${#text}

    for ((i=0; i<len; i++)); do
        R=$(( R1 + (R2-R1)*i/len ))
        G=$(( G1 + (G2-G1)*i/len ))
        B=$(( B1 + (B2-B1)*i/len ))
        # Map RGB to nearest 256-color code
        r=$((R*6/256))
        g=$((G*6/256))
        b=$((B*6/256))
        color=$((16 + 36*r + 6*g + b))
        printf "\033[38;5;%sm%s" "$color" "${text:$i:1}"
    done
    printf "\033[0m\n"
}

# --- Colors ---
RED='\033[38;5;197m'
GREEN='\033[38;5;82m'
YELLOW='\033[38;5;226m'
BLUE='\033[38;5;63m'
MAGENTA='\033[38;5;205m'
RESET='\033[0m'

# Fancy symbols
FANCY_LINE=" ✿❀✧⋆∘✦ ⋆.˚ ᡣ.𖥔˚ ✦ "
tab=">-   "

# --- Check branch ---
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" == "main" ]]; then
    echo -e "${RED}${tab}❌ ERROR: You are on 'main'. Switch to a feature branch first.${RESET}"
    exit
fi

# --- Check for uncommitted changes ---
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}${tab}❌ ERROR: You have uncommitted changes. Commit or stash them before merging.${RESET}"
    exit
fi

# --- Show header ---
echo
echo
gradient_echo_rgb "$FANCY_LINE ⋆.˚ ⋆.˚ ⋆.˚" 255 105 180 0 0 0
echo -e "${MAGENTA}${tab}✨ Merging current branch into main${RESET}"
echo -e "${MAGENTA}${tab}🌸 Current branch: ${YELLOW}'$CURRENT_BRANCH'${RESET}"
echo
echo -e "${MAGENTA}${tab}❔ Press ENTER to confirm, or type anything else to cancel:${RESET}"
gradient_echo_rgb "$FANCY_LINE ⋆.˚ ⋆.˚ ⋆.˚" 255 105 180 0 0 0

# --- Confirm with user ---
read -r CONFIRM
if [[ -n "$CONFIRM" ]]; then
    echo -e "${RED}${tab}❌ Merge cancelled by user.${RESET}"
    exit
fi

# --- Fetch and merge ---
echo
echo -e "${BLUE}${tab}⏳ Fetching latest main from remote...${RESET}"
git fetch origin main

# Save original branch to return later
ORIGINAL_BRANCH="$CURRENT_BRANCH"

# Checkout main and merge
echo
echo -e "${BLUE}${tab}🔀 Checking out 'main'...${RESET}"
git checkout main

echo
echo -e "${BLUE}${tab}✨ Merging '$CURRENT_BRANCH' into main...${RESET}"
if ! git merge --no-ff "$CURRENT_BRANCH"; then
    echo -e "${RED}${tab}❌ Merge conflict! Resolve conflicts manually.${RESET}"
    # Checkout back to original branch even if merge fails
    git checkout "$ORIGINAL_BRANCH"
    exit
fi

# --- Push merged main ---
echo
echo -e "${BLUE}${tab}🚀 Pushing merged 'main' to origin...${RESET}"
git push origin main --quiet

# Checkout back to original branch
git checkout "$ORIGINAL_BRANCH"

# --- Done message ---
echo
echo
gradient_echo_rgb "$FANCY_LINE ⋆.˚ ⋆.˚ ⋆.˚" 255 105 180 0 0 0
echo -e "${GREEN}${tab}✅ Merge complete! :3  main has been updated with ${YELLOW}'$CURRENT_BRANCH'${RESET}"
gradient_echo_rgb "$FANCY_LINE ⋆.˚ ⋆.˚ ⋆.˚" 255 105 180 0 0 0
echo
