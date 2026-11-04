module.exports = {
  apps: [
    {
      name: 'space-shooter-odyssey',
      script: 'backend/dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Restart delay if crash occurs
      restart_delay: 2000,
      // Exponential backoff restart delay to prevent rapid crash loops
      exp_backoff_restart_delay: 100,
      max_restarts: 50,
      min_uptime: '5s'
    }
  ]
};
