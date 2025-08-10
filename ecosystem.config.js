module.exports = {
  apps: [
    {
      name: 'vivo-frontend',
      cwd: '/var/www/vivoApp',
      script: 'npm',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '144.91.79.8',
      ref: 'origin/ogaro',
      repo: 'git@github.com:Maogast/vivoApp.git',
      path: '/var/www/vivoApp',

      // Build & prune everything locally
      'pre-deploy-local': 'npm ci && npm run build && npm prune --production',

      // On the server: sync files, then...
      'post-deploy': [
        'cd /var/www/vivoApp',

        // 1) Only install if missing (or you manually rm -rf)
        'if [ ! -d node_modules ]; then npm ci --omit=dev; fi',

        // 2) Run migrations only if that script is present
        'if [ -f scripts/migrate.js ]; then ' +
          'export NODE_OPTIONS="--max_old_space_size=512" && ' +
          'npm run migrate; ' +
        'else echo "No migrate.js found — skipping migrations"; fi',

        // 3) Clear any caches, then reload
        'npm run clear-cache',
        'pm2 reload ecosystem.config.js --env production'
      ].join(' && '),

      // avoid interactive host verification prompts
      ssh_options: 'StrictHostKeyChecking=no'
    }
  }
};
