import path from 'path';
import express from 'express';
import expressWs from 'express-ws';

import routes from './routes';
import { openSockets } from './open-sockets';
import { startEpaper } from './epaper';

export function startServer() {
  const NODE_ENV = process.env.NODE_ENV || 'production';

  const app = expressWs(express()).app;

  app.use(express.json());

  app.use('/api', routes);
  app.ws('/ws', function(ws, req) {
    ws.on('message', (msg) => {
      console.log(msg);
      if (msg.toString() === 'listen') {
        openSockets.push(ws);
      }
    });
  });
  if (NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client')));
    app.use('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/index.html'));
    });
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  app.listen(port, 'localhost', () => {
    console.log(`started running in port ${port}`);
    startEpaper();
  });

  return app;
}
