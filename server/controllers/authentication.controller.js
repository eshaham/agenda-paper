const moment = require('moment');
const jwt = require('jsonwebtoken');

const { convertCodeToRefreshToken, createAuthUrl } = require('../lib/google.api');
const { initializePayload } = require('../middlewares/general.middleware');

const SITE_URL = 'http://localhost:3000';

exports.loginUser = () => [
  async (req, res) => {
    const url = createAuthUrl();
    res.redirect(url);
  },
];

const verifyCode = () => (req, res, next) => {
  const { query, payload } = req;
  const { code } = query;

  if (!code) {
    console.error('auth code was not sent');
    return res.status(400).send('auth code was not sent');
  }

  payload.code = code;

  return next();
};

const initGoogleClient = () => async (req, res, next) => {
  const { payload } = req;
  const { code } = payload;

  try {
    payload.googleRefreshToken = await convertCodeToRefreshToken(code);
  } catch (e) {
    console.error('converting auth code to tokens failed');
    return res.status(500).send();
  }

  return next();
};

const createSessionToken = () => (req, res, next) => {
  const { payload } = req;
  const { googleRefreshToken } = payload;

  const expirationMoment = moment().add(6, 'months');

  const maxAgeInMillis = expirationMoment.diff(moment());
  const maxAgeInSeconds = Math.round(maxAgeInMillis / 1000);
  const tokenPayload = { googleRefreshToken };
  const token = jwt.sign(tokenPayload, process.env.AUTH_SECRET, {
    expiresIn: maxAgeInSeconds,
  });

  payload.sessionToken = token;
  payload.sessionMaxAge = maxAgeInMillis;

  next();
};

const sendSessionCookie = () => (req, res, next) => {
  const { payload } = req;
  const { sessionToken, sessionMaxAge } = payload;
  res.cookie('__session', sessionToken, { maxAge: sessionMaxAge, httpOnly: true });

  next();
};

const redirectAfterAuth = () => (req, res) => {
  return res.redirect(SITE_URL);
};

exports.authorizeUser = () => [
  initializePayload(),
  verifyCode(),
  initGoogleClient(),
  createSessionToken(),
  sendSessionCookie(),
  redirectAfterAuth(),
];
