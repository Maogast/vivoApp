module.exports = {
  apps: [
    {
      name: "vivo-frontend",
      cwd: "/var/www/vivo-main-frontend",
      script: "npm",
      args: "run start",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      // These env vars will be injected when you do `pm2 start --env production`
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
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

      // Local: only used if you run `pm2 deploy production setup`
      "pre-deploy-local": "",

      // Remote: clone fresh → install prod deps → build → reload
      "post-deploy": [
        "cd /var/www/vivo-main-frontend",
        "npm ci --omit=dev",
        "npm run build",
        "pm2 reload ecosystem.config.js --env production"
      ].join(" && ")
    }
  }
};
