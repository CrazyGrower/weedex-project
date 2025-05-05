module.exports = {
  apps: [{
    name: 'weedex-api',
    script: 'build/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 3333
    }
  }]
} 