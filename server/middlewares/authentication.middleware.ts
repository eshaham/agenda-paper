import fs from 'fs';
import os from 'os';
import { NextFunction, Request, Response } from 'express';

import { APRequest } from '../requests-types';
import { initializePayload } from './general.middleware';

const asyncFs = fs.promises;
const CONFIG_FOLDER = `${os.homedir()}/.agenda-paper`;
const TOKEN_PATH = `${CONFIG_FOLDER}/.token`;

export const loadGoogleRefreshTokenIfExists = () => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { payload } = <APRequest>req;

  if (fs.existsSync(TOKEN_PATH)) {
    const token = await asyncFs.readFile(TOKEN_PATH);
    payload.googleRefreshToken = token.toString();
  }

  next();
};

export const storeRefreshToken = () => async (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { googleRefreshToken } = <{ googleRefreshToken: string }>payload;

  if (!fs.existsSync(CONFIG_FOLDER)) {
    fs.mkdirSync(CONFIG_FOLDER);
  }
  await asyncFs.writeFile(`${CONFIG_FOLDER}/.token`, googleRefreshToken);

  next();
};

export const authenticate = () => [
  initializePayload(),
  loadGoogleRefreshTokenIfExists(),
  async (req: Request, res: Response, next: NextFunction) => {
    const { payload } = <APRequest>req;
    const { googleRefreshToken } = <{ googleRefreshToken: string }>payload;

    if (!googleRefreshToken) {
      return res.status(401).send('user not authenticated');
    }

    next();
  },
];
