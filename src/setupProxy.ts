import { Express } from 'express';
import * as proxyMiddleware from 'http-proxy-middleware';

module.exports = function(app: Express) {
  app.use(
    '/api',
    proxyMiddleware.createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );
};
