import path from 'path';
import dotEnv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';

import routes from './routes';
import { startEpaper } from './epaper';

dotEnv.config({ path: path.join(__dirname, '../.env') });

const app = express();

app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../client')));

app.use('/api', routes);
app.use('*', (req, res) =>{
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`started running in port ${port}`);
  startEpaper();
});
