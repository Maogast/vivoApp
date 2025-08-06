#!/usr/bin/env bash
set -euo pipefail

# Load deployment environment variables
if [ ! -f ../.env.deploy ]; then
  echo "Error: .env.deploy not found in project root."
  exit 1
fi
source ../.env.deploy

# Build locally
echo "Building Next.js app…"
npm run build

# Sync files to server
echo "Syncing files to $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH"
rsync -avz \
  --delete \
  .next/ public/ package.json package-lock.json ecosystem.config.js .env.production \
  -e "ssh -i $SSH_KEY_PATH" \
  $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH

# Restart on server
ssh -i "$SSH_KEY_PATH" $DEPLOY_USER@$DEPLOY_HOST << 'EOF'
  cd "$DEPLOY_PATH"
  npm install --production
  pm2 reload ecosystem.config.js --env production
EOF

echo "Deployment complete! 🎉"