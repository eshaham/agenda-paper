import moment from 'moment';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

import { APRequest } from '../requests-types';
import { convertCodeToRefreshToken, createAuthUrl } from '../lib/google.api';
import { initializePayload } from '../middlewares/general.middleware';
import { getEnvVariableOrDie } from '../helpers/env.helper';

const SITE_URL = 'http://localhost:3000';

export const loginUser = () => [
  async (req: Request, res: Response) => {
    const url = createAuthUrl();
    res.redirect(url);
  },
];

const verifyCode = () => (req: Request, res: Response, next: NextFunction) => {
  const { query, payload } = <APRequest>req;
  const { code } = query;

  if (!code) {
    console.error('auth code was not sent');
    return res.status(400).send('auth code was not sent');
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

const createSessionToken = () => (req: Request, res: Response, next: NextFunction) => {
  const AUTH_SECRET = getEnvVariableOrDie('AUTH_SECRET');

  const { payload } = <APRequest>req;
  const { googleRefreshToken } = payload;

  const expirationMoment = moment().add(6, 'months');

  const maxAgeInMillis = expirationMoment.diff(moment());
  const maxAgeInSeconds = Math.round(maxAgeInMillis / 1000);
  const tokenPayload = { googleRefreshToken };
  const token = jwt.sign(tokenPayload, AUTH_SECRET, {
    expiresIn: maxAgeInSeconds,
  });

  payload.sessionToken = token;
  payload.sessionMaxAge = maxAgeInMillis;

  next();
};

const sendSessionCookie = () => (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { sessionToken, sessionMaxAge } = <{
    sessionToken: string,
    sessionMaxAge: number,
  }>payload;

  res.cookie('__session', sessionToken, { maxAge: sessionMaxAge, httpOnly: true });

  next();
};

const redirectAfterAuth = () => (req: Request, res: Response) => {
  return res.redirect(SITE_URL);
};

export const authorizeUser = () => [
  initializePayload(),
  verifyCode(),
  initGoogleClient(),
  createSessionToken(),
  sendSessionCookie(),
  redirectAfterAuth(),
];
