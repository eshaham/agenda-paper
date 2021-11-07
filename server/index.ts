import dotEnv from 'dotenv';

import { ENV_FILE_PATH } from './constants';
import { startServer } from './server';

dotEnv.config({ path: ENV_FILE_PATH });

function verifyEnvVariableOrExit(variableName: string) {
  if (!process.env[variableName]) {
    console.error(`${variableName} env variable is missing`);
    process.exit(1);
  }
}

verifyEnvVariableOrExit('GOOGLE_CLIENT_ID');
verifyEnvVariableOrExit('GOOGLE_CLIENT_SECRET');

startServer();
