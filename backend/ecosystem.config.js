module.exports = {
  apps: [{
    name: 'spotichris-backend',
    script: './dist/index.js',
    instances: 2, // Nombre d'instances (ou 'max' pour utiliser tous les CPU)
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    // Options de redémarrage
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    // Variables d'environnement (seront surchargées par .env)
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}




