import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getEnvVariableOrDie } from '../helpers/env.helper';

import { APRequest } from '../requests-types';
import { initializePayload } from './general.middleware';

function getTokenCookie(req: Request) {
  if (!req.cookies || !req.cookies.__session) {
    return null;
  }

  return req.cookies.__session;
}

function assignToken() {
  return (req: Request, res: Response, next: NextFunction) => {
    const { payload } = <APRequest>req;
    const token = getTokenCookie(req);
    if (!token) {
      console.info('rejecting token since it wasn\'t provided');
      return res.status(401).send('Unauthorized: No token provided');
    }

    payload.token = token;

    return next();
  };
}

function assignGoogleRefreshToken() {
  return (req: Request, res: Response, next: NextFunction) => {
    const AUTH_SECRET = getEnvVariableOrDie('AUTH_SECRET');

    const { payload } = <APRequest>req;
    const { token } = <{ token: string }>payload;

    let data;
    try {
      data = jwt.verify(token, AUTH_SECRET);
    } catch (e) {
      console.debug('rejecting token since it is invalid');
      return res.status(401).send('Unauthorized: Invalid token');
    }
    const { googleRefreshToken } = <{ googleRefreshToken: string }>data;
    payload.googleRefreshToken = googleRefreshToken;

    return next();
  };
}

export const authenticate = () => [
  initializePayload(),
  assignToken(),
  assignGoogleRefreshToken(),
];

export const verifyToken = () => (req: Request, res: Response) => {
  const { payload } = <APRequest>req;
  const { password } = <{ password: string }>payload;

  res.json({ password });
};
