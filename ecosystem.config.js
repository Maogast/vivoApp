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
      'post-deploy': [
        'npm ci --omit=dev',
        'npm run build',
        'npm run migrate',
        'npm run clear-cache',
        'pm2 reload ecosystem.config.js --env production'
      ].join(' && ')
    }
  }
};