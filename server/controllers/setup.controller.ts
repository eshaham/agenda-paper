import path from 'path';
import dotEnv from 'dotenv';
import { NextFunction, Request, Response } from 'express';

import { APRequest } from '../requests-types';
import { initializePayload } from '../middlewares/general.middleware';
import { updateEnvFile } from '../helpers/env.helper';

const loadVariables = () => (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const authSecret = process.env.AUTH_SECRET;

  payload.clientId = clientId;
  payload.clientSecret = clientSecret;
  payload.authSecret = authSecret;

  next();
};

export const getVariables = () => [
  initializePayload(),
  loadVariables(),
  async (req: Request, res: Response) => {
    const { payload } = <APRequest>req;
    const { clientId, clientSecret, authSecret } = payload;

    res.json({ clientId, clientSecret, authSecret });
  },
];

const extractVariables = () => (req: Request, res: Response, next: NextFunction) => {
  const { body, payload } = <APRequest>req;
  const { clientId, clientSecret, authSecret } = body;

  if (!clientId) {
    const msg = 'clientId not provided';
    console.info(msg);
    return res.status(400).send(msg);
  }

  if (!clientSecret) {
    const msg = 'clientSecret not provided';
    console.info(msg);
    return res.status(400).send(msg);
  }

  if (!authSecret) {
    const msg = 'authSecret not provided';
    console.info(msg);
    return res.status(400).send(msg);
  }

  payload.clientId = clientId;
  payload.clientSecret = clientSecret;
  payload.authSecret = authSecret;

  return next();
};

const saveVariables = () => (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { clientId, clientSecret, authSecret } = <{
    clientId: string,
    clientSecret: string,
    authSecret: string,
  }>payload;

  process.env.GOOGLE_CLIENT_ID = clientId;
  process.env.GOOGLE_CLIENT_SECRET = clientSecret;
  process.env.AUTH_SECRET = authSecret;

  updateEnvFile(path.join(__dirname, '../../.env'), ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'AUTH_SECRET']);
  dotEnv.config({ path: path.join(__dirname, '../../.env') });

  next();
};

export const setupVariables = () => [
  initializePayload(),
  extractVariables(),
  saveVariables(),
  async (req: Request, res: Response) => {
    res.json({ success: true });
  },
];
