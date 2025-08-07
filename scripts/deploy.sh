#!/usr/bin/env bash
set -euo pipefail

# Ensure we’re running from the repo root
cd "$(dirname "$0")/.."

# Load deployment environment variables
if [ ! -f .env.deploy ]; then
  echo "Error: .env.deploy not found in project root."
  exit 1
fi
source .env.deploy

echo "Building Next.js app…"
npm run build

# Prepare remote directory: delete old files, create if missing
echo "Cleaning remote directory on $DEPLOY_HOST…"
ssh -i "$SSH_KEY_PATH" $DEPLOY_USER@$DEPLOY_HOST << EOF
  mkdir -p "$DEPLOY_PATH"
  rm -rf "$DEPLOY_PATH"/*
EOF

# Copy build artifacts and static assets
echo "Uploading files via scp…"
scp -i "$SSH_KEY_PATH" -r \
  .next public package.json package-lock.json ecosystem.config.js .env.production \
  $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH

# Install dependencies & reload PM2
echo "Installing on server & restarting app…"
ssh -i "$SSH_KEY_PATH" $DEPLOY_USER@$DEPLOY_HOST << EOF
  cd "$DEPLOY_PATH"
  npm install --production
  pm2 reload ecosystem.config.js --env production
EOF

echo "Deployment complete! 🎉"
