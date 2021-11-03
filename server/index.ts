import path from 'path';
import dotEnv from 'dotenv';

import { startServer } from './server';

dotEnv.config({ path: path.join(__dirname, '../.env') });

function verifyEnvVariableOrExit(variableName: string) {
  if (!process.env[variableName]) {
    console.error(`${variableName} env variable is missing`);
    process.exit(1);
  }
}

verifyEnvVariableOrExit('GOOGLE_CLIENT_ID');
verifyEnvVariableOrExit('GOOGLE_CLIENT_SECRET');

startServer();
