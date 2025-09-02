// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "vivo-frontend",
      cwd: "/var/www/vivo-main-frontend/current",
      script: "npm",
      args: "run start",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      // Runtime env for server process only
      env: {
        PORT: 3000
      },

      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ],

  deploy: {
    production: {
      user: "root",
      host: "144.91.79.8",
      ref: "origin/ogaro",
      repo: "git@github.com:Maogast/vivoApp.git",
      path: "/var/www/vivo-main-frontend",
      key: "~/.ssh/id_ed25519",
      ssh_options: "StrictHostKeyChecking=no",

      // ✅ Copy .env.production into the release folder before build
      "pre-deploy-local":
        "scp -i ~/.ssh/id_ed25519 .env.production root@144.91.79.8:{{release_path}}/.env.production",

      // ✅ Build fresh and reload PM2 + Nginx
      "post-deploy": [
        "cd {{release_path}}",
        "npm ci --omit=dev",
        "npm install typescript --no-save",
        "rm -rf .next", // ensure no stale build
        "npm run build",
        "pm2 reload ecosystem.config.js --env production",
        "sudo nginx -t && sudo systemctl reload nginx"
      ].join(" && ")
    }
  }
};
