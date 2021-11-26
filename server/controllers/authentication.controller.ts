import { NextFunction, Request, Response } from 'express';

import { APRequest } from '../requests-types';
import { convertCodeToRefreshToken, createAuthUrl } from '../lib/google.api';
import { openSockets } from '../open-sockets';
import { initializePayload } from '../middlewares/general.middleware';
import { loadGoogleRefreshTokenIfExists, storeRefreshToken } from '../middlewares/authentication.middleware';
import { verifyConfigFolderExists } from '../middlewares/config.middleware';

const SITE_URL = 'http://localhost:3000';

export const isLoggedIn = () => [
  initializePayload(),
  loadGoogleRefreshTokenIfExists(),
  async (req: Request, res: Response) => {
    const { payload } = <APRequest>req;
    const { googleRefreshToken } = <{ googleRefreshToken: string }>payload;

    res.json({ isLoggedIn: !!googleRefreshToken });
  },
];

export const loginUser = () => [
  initializePayload(),
  async (req: Request, res: Response) => {
    const url = createAuthUrl();
    res.redirect(url);
  },
];

const verifyCode = () => (req: Request, res: Response, next: NextFunction) => {
  const { query, payload } = <APRequest>req;
  const { code } = query;

  if (!code) {
    const msg = 'auth code was not sent';
    console.error(msg);
    return res.status(400).send(msg);
  }

  payload.code = code;

  return next();
};

const initGoogleClient = () => async (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { code } = <{ code: string }>payload;

  try {
    payload.googleRefreshToken = await convertCodeToRefreshToken(code);
  } catch (e) {
    console.error('converting auth code to tokens failed');
    return res.status(500).send();
  }

  return next();
};

const notifySocketsAboutLogin = () => (req: Request, res: Response, next: NextFunction) => {
  openSockets.forEach((socket) => {
    socket.send('loggedIn');
  });

  next();
};

const redirectAfterAuth = () => (req: Request, res: Response) => {
  return res.redirect(SITE_URL);
};

export const authorizeUser = () => [
  initializePayload(),
  verifyCode(),
  initGoogleClient(),
  verifyConfigFolderExists(),
  storeRefreshToken(),
  notifySocketsAboutLogin(),
  redirectAfterAuth(),
];
