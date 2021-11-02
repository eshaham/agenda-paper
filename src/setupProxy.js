const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/auth/login',
    (req, res) => {
      const queryStr = Object.keys(req.query).map((p) => `${p}=${req.query[p]}`).join('&');
      res.redirect(`http://localhost:8080/api/auth/login${req.path}?${queryStr}`);
    },
  );

  app.use(
    ['/api'],
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    }),
  );

  app.use(
    createProxyMiddleware(
      '/ws',
      {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug',
      }),
  );
};
