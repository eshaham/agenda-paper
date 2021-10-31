import path from 'path';
import dotEnv from 'dotenv';

import { startServer } from './server';

dotEnv.config({ path: path.join(__dirname, '../.env') });

startServer();
