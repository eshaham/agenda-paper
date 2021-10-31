import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';

import routes from './routes';
import { startEpaper } from './epaper';

export function startServer() {
  const app = express();

  app.use(cookieParser());

  app.use(express.static(path.join(__dirname, '../client')));

  app.use('/api', routes);
  app.use('*', (req, res) =>{
    res.sendFile(path.join(__dirname, '../client/index.html'));
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`started running in port ${port}`);
    startEpaper();
  });

  return app;
}
