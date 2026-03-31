module.exports = {
  apps: [
    {
      name: 'pretty-tiffin-backend',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
