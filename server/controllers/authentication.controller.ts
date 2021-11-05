import moment from 'moment';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

import { APRequest } from '../requests-types';
import { convertCodeToRefreshToken, createAuthUrl } from '../lib/google.api';
import { getEnvVariableOrDie } from '../helpers/env.helper';
import { openSockets, SocketData } from '../open-sockets';
import { initializePayload } from '../middlewares/general.middleware';

const SITE_URL = 'http://localhost:3000';

const extractOTP = () => (req: Request, res: Response, next: NextFunction) => {
  const { query, payload } = <APRequest>req;
  const { otp } = query;

  if (!otp) {
    const msg = 'otp was not sent';
    console.error(msg);
    return res.status(400).send(msg);
  }

  payload.otp = otp;

  return next();
};

export const loginUser = () => [
  initializePayload(),
  extractOTP(),
  async (req: Request, res: Response) => {
    const { payload } = <APRequest>req;
    const { otp } = <{ otp: string }>payload;
    const url = createAuthUrl(otp);
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

const extractState = () => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { query, payload } = <APRequest>req;
  const { state: stateStr } = <{ state?: string }>query;
  if (!stateStr) {
    console.error('state was not returned from google');
    return res.status(400).send('missing state param');
  }

  const state = <{ otp: string }>JSON.parse(stateStr);
  const { otp } = state;

  payload.otp = otp;

  return next();
};

const verifySocketExists = () => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { payload } = <APRequest>req;
  const { otp } = <{ otp: string }>payload;

  if (!otp) {
    console.error('otp was not sent as part of the login state');
    return res.status(400).send('missing otp param');
  }

  if (!openSockets[otp]) {
    const msg = `unknown otp ${otp}`;
    console.error(msg);
    return res.status(400).send(openSockets[otp]);
  }

  payload.socketData = openSockets[otp];

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

const storeRefreshTokenForSocket = () => (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { socketData, googleRefreshToken } = <{
    socketData: SocketData,
    googleRefreshToken: string,
  }>payload;

  socketData.googleRefreshToken = googleRefreshToken;

  next();
};

const notifySocketAboutLogin = () => (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { socketData } = <{ socketData: SocketData }>payload;

  const { socket, password } = socketData;
  const msg = { type: 'loggedIn', password };
  socket.send(JSON.stringify(msg));

  next();
};

const createSessionToken = () => (req: Request, res: Response, next: NextFunction) => {
  const AUTH_SECRET = getEnvVariableOrDie('AUTH_SECRET');

  const { payload } = <APRequest>req;
  const { googleRefreshToken, password } = payload;

  const expirationMoment = moment().add(6, 'months');

  const maxAgeInMillis = expirationMoment.diff(moment());
  const maxAgeInSeconds = Math.round(maxAgeInMillis / 1000);
  const tokenPayload = { googleRefreshToken, password };
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
  extractState(),
  verifySocketExists(),
  initGoogleClient(),
  storeRefreshTokenForSocket(),
  notifySocketAboutLogin(),
  createSessionToken(),
  sendSessionCookie(),
  redirectAfterAuth(),
];

const extractCredentials = () => (req: Request, res: Response, next: NextFunction) => {
  const { body, payload } = <APRequest>req;
  const { otp, password } = body;

  if (!otp) {
    const msg = 'otp not provided';
    console.info(msg);
    return res.status(400).send(msg);
  }

  if (!password) {
    const msg = 'password not provided';
    console.info(msg);
    return res.status(400).send(msg);
  }

  payload.otp = otp;
  payload.password = password;

  return next();
};

const verifyCredentials = () => (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { otp: sentOTP, password: sentPassword } = <{ otp: number, password: string }>payload;

  const socketData = openSockets[sentOTP];
  if (!socketData) {
    console.info(`rejecting associated user because otp ${sentOTP} is unknown`);
    return res.status(401).send('Unauthorized: Given credentials could not be matched');
  }

  const { password, googleRefreshToken } = socketData;

  if (sentPassword !== password) {
    console.info(`rejecting associated user because password ${password} is incorrect`);
    return res.status(401).send('Unauthorized: Given credentials could not be matched');
  }

  payload.googleRefreshToken = googleRefreshToken;

  return next();
};


export const associateUser = () => [
  initializePayload(),
  extractCredentials(),
  verifyCredentials(),
  createSessionToken(),
  sendSessionCookie(),
  (req: Request, res: Response) => res.status(200).send(),
];
