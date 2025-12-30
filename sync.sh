#!/bin/bash
TOKEN=$GITHUB_PERSONAL_ACCESS_TOKEN
REMOTE_URL="https://$TOKEN@github.com/astrotechmanychat-a11y/lpleitoresconvictos.git"

git add .
git commit -m "Update from Replit Mobile: $(date)"
git push "$REMOTE_URL" main --force
