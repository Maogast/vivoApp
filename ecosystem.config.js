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

      env: {
        PORT: 3000
      },

      env_production: {
        NODE_ENV: "production",
        // These are only used at runtime (next start),
        // build‐time vars come from .env.production
        NEXT_PUBLIC_API_BASE_URL:
          "https://vivo3.bitsnke.co.ke/VIVOAPI/ODataV4/Company('VIVO')",
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

      // 1) Before any SSH or git‐clone happens, scp your local .env.local
      //    into the new release folder as .env.production
      "pre-deploy-local":
        "scp -i ~/.ssh/id_ed25519 .env.production root@144.91.79.8:/var/www/vivo-main-frontend/shared/.env.production",

      // 2) On the remote, build and reload
      "post-deploy": [
        "ln -nfs /var/www/vivo-main-frontend/shared/.env.production .env.production",
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
