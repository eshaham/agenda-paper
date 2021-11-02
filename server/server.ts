import path from 'path';
import express from 'express';
import expressWs from 'express-ws';
import cookieParser from 'cookie-parser';
import passwordGenerator from 'generate-password';

import routes from './routes';
import { openSockets } from './open-sockets';
import { startEpaper } from './epaper';

export function startServer() {
  const NODE_ENV = process.env.NODE_ENV || 'production';

  const app = express();
  const wsApp = expressWs(app).app;

  app.use(cookieParser());
  app.use(express.json());

  app.use('/api', routes);
  wsApp.ws('/ws', function(ws, req) {
    ws.on('message', (msg) => {
      const data = JSON.parse(msg.toString());
      const { otp } = data;
      const password = passwordGenerator.generate({ numbers: true, symbols: true });
      openSockets[otp] = { socket: ws, password };
    });
  });
  if (NODE_ENV === 'production') {
    app.use('*', (req, res) =>{
      res.sendFile(path.join(__dirname, '../client/index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`started running in port ${port}`);
    startEpaper();
  });

  return app;
}
