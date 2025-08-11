module.exports = {
  apps: [
    {
      name: 'vivo-frontend',
      cwd: '/var/www/vivoApp',
      script: 'npm',
      args: 'run start',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '144.91.79.8',
      key: '~/.ssh/id_ed25519',
      ref: 'origin/ogaro',
      repo: 'git@github.com:Maogast/vivoApp.git',
      path: '/var/www/vivoApp',

      // Build locally on WSL/ext4
      'pre-deploy-local': 'npm ci && npm run build',

      // Remote post-deploy: prune, install, clear cache, reload
      'post-deploy': [
        'cd /var/www/vivoApp',
        'npm prune --production',
        'npm ci --omit=dev',
        'npm run clear-cache',
        'pm2 reload ecosystem.config.js --env production'
      ].join(' && '),

      ssh_options: 'StrictHostKeyChecking=no'
    }
  }
};
