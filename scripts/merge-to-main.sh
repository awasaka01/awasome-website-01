#!/bin/bash
# scripts/merge-to-main.sh
set -e


# ————————————————————————————————————————————————————————————
#  Identity:
# ————————————————————————————————————————————————————————————
RAW_NAME="[rawrbot]"
RAW_EMAIL="rawrbot@example.com"
# export GIT_AUTHOR_NAME="$RAW_NAME"
# export GIT_AUTHOR_EMAIL="$RAW_EMAIL"
# export GIT_COMMITTER_NAME="$RAW_NAME"
# export GIT_COMMITTER_EMAIL="$RAW_EMAIL"


# ————————————————————————————————————————————————————————————
#  Fancy Functions & Colors:
# ————————————————————————————————————————————————————————————
gradient_echo_rgb() {
    local text="$1"
    local R1=$2 G1=$3 B1=$4
    local R2=$5 G2=$6 B2=$7
    local len=${#text}

    for ((i=0; i<len; i++)); do
        R=$(( R1 + (R2-R1)*i/len ))
        G=$(( G1 + (G2-G1)*i/len ))
        B=$(( B1 + (B2-B1)*i/len ))
        r=$((R*6/256))
        g=$((G*6/256))
        b=$((B*6/256))
        color=$((16 + 36*r + 6*g + b))
        printf "\033[38;5;%sm%s" "$color" "${text:$i:1}"
    done
    printf "\033[0m\n"
}

RED='\033[38;5;197m'
GREEN='\033[38;5;82m'
YELLOW='\033[38;5;226m'
BLUE='\033[38;5;63m'
MAGENTA='\033[38;5;205m'
RESET='\033[0m'
FANCY_LINE=" ✿❀✧⋆∘✦ ⋆.˚ ᡣ.𖥔˚ ✦ "
tab=">-   "


# ————————————————————————————————————————————————————————————
#  Detect current branch:
# ————————————————————————————————————————————————————————————
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" == "main" ]]; then
    echo -e "${RED}${tab}❌ ERROR: You are already on main, you can't merge main to main silly${RESET}"
    exit 1
fi
ORIGINAL_BRANCH="$CURRENT_BRANCH" # Store the original branch, it will change


# ————————————————————————————————————————————————————————————
#  Confirm correct branch:
# ————————————————————————————————————————————————————————————
gradient_echo_rgb "$FANCY_LINE ⋆.˚ ⋆.˚ ⋆.˚" 255 105 180 0 0 0
echo -e "${YELLOW}${tab}⚠️  You are about to merge $ORIGINAL_BRANCH to main!${RESET}"
echo -e "${MAGENTA}${tab}❔ Press ENTER to confirm, or type anything else to cancel:${RESET}"
gradient_echo_rgb "$FANCY_LINE ⋆.˚ ⋆.˚ ⋆.˚" 255 105 180 0 0 0
read -r CONFIRM_MAIN
if [[ -n "$CONFIRM_MAIN" ]]; then
	echo -e "${RED}${tab}❌ Merge cancelled by user.${RESET}"
	exit 1
fi


# ————————————————————————————————————————————————————————————
#  Auto-commit pending changes:
# ————————————————————————————————————————————————————————————
if [[ -n $(git status --porcelain) ]]; then
    gradient_echo_rgb "$FANCY_LINE ⋆.˚ ⋆.˚ ⋆.˚" 255 105 180 0 0 0
    echo -e "${YELLOW}${tab}⚠️  You have uncommitted changes!${RESET}"
    echo -e "${MAGENTA}${tab}❔ Press ENTER to commit them manually, or type anything else to cancel:${RESET}"
    gradient_echo_rgb "$FANCY_LINE ⋆.˚ ⋆.˚ ⋆.˚" 255 105 180 0 0 0
    read -r CONFIRM_CHANGES
    if [[ -n "$CONFIRM_CHANGES" ]]; then
        echo -e "${RED}${tab}❌ Merge cancelled by user due to pending changes.${RESET}"
        exit 1
    fi

    git add -A # Stage all changes
    git commit # Manual commit: user types the commit message
fi


# ————————————————————————————————————————————————————————————
#  Switch to main branch:
# ————————————————————————————————————————————————————————————
git push
echo -e "${BLUE}${tab}⏳ Switching to 'main'...${RESET}"
git fetch origin main
git checkout main
git pull origin main


# ————————————————————————————————————————————————————————————
#  Force merge, priority to current branch:
# ————————————————————————————————————————————————————————————
echo -e "${BLUE}${tab}🔀 Merging '$CURRENT_BRANCH' into main (force conflicts to branch)...${RESET}"
git -c user.name="rawrbot" -c user.email="rawrbot@example.com" merge --no-ff "$CURRENT_BRANCH" -m "merged from '$CURRENT_BRANCH'" -X theirs || {
    echo -e "${RED}${tab}❌ Merge failed. Resolve conflicts manually.${RESET}"
    git checkout "$ORIGINAL_BRANCH"
    exit 1
}


# ————————————————————————————————————————————————————————————
#  Push the merged main:
# ————————————————————————————————————————————————————————————
echo -e "${BLUE}${tab}🚀 Pushing merged 'main' to origin...${RESET}"
git push origin main --quiet


# ————————————————————————————————————————————————————————————
#  Return to original branch:
# ————————————————————————————————————————————————————————————
git checkout "$ORIGINAL_BRANCH"

echo
gradient_echo_rgb "$FANCY_LINE ⋆.˚ ⋆.˚ ⋆.˚" 255 105 180 0 0 0
echo -e "${GREEN}${tab}✅ Merge complete! 'main' updated with '$CURRENT_BRANCH'${RESET}"
echo -e "${MAGENTA}${tab}🔗 https://github.com/awasaka01/awasome-website-01/actions/workflows/build.yaml${RESET}"
gradient_echo_rgb "$FANCY_LINE ⋆.˚ ⋆.˚ ⋆.˚" 255 105 180 0 0 0
echo
