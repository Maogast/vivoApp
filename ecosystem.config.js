module.exports = {
  apps: [
    {
      name: "vivo-frontend",
      cwd: "/var/www/vivo-main-frontend/current",  // ← run inside the current release
      script: "npm",
      args: "run start",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      // default env (always applied)
      env: {
        PORT: 3000
      },

      // only when you do `--env production`
      env_production: {
        NODE_ENV: "production",
        NEXT_PUBLIC_API_BASE_URL:
          "http://109.123.250.165:8048/VIVOAPI/ODataV4/Company('VIVO')",
        NEXT_PUBLIC_API_USERNAME: "VAPI",
        NEXT_PUBLIC_API_PASSWORD:
          "DtdQj7LCjAnuNnAx/f3llUGWZ6MkfR4XBkJvHUEY/ZU="
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

      // only for `pm2 deploy production setup` (you can leave blank)
      "pre-deploy-local": "",

      // On each `pm2 deploy`, PM2 will:
      //  • checkout into releases/<timestamp>
      //  • symlink releases/<timestamp> → current
      //  • then run this post-deploy inside the **current** folder
      "post-deploy": [
        "cd /var/www/vivo-main-frontend/current",
        "npm ci --omit=dev",
        "npm run build",
        "pm2 reload ecosystem.config.js --env production"
      ].join(" && ")
    }
  }
};
