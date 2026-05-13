const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://secure-online-voting-system-production.up.railway.app',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
  );
};