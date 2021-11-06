import fs from 'fs';
import { NextFunction, Request, Response } from 'express';

import { CONFIG_FOLDER, TOKEN_FILE_PATH } from '../constants';
import { APRequest } from '../requests-types';
import { initializePayload } from './general.middleware';

const asyncFs = fs.promises;

export const loadGoogleRefreshTokenIfExists = () => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { payload } = <APRequest>req;

  if (fs.existsSync(TOKEN_FILE_PATH)) {
    const token = await asyncFs.readFile(TOKEN_FILE_PATH);
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
