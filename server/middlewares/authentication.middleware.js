const jwt = require('jsonwebtoken');
const { initializePayload } = require('./general.middleware');

function getTokenCookie(req) {
  if (!req.cookies || !req.cookies.__session) {
    return null;
  }

  return req.cookies.__session;
}

function assignToken() {
  return (req, res, next) => {
    const { payload } = req;
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
  return (req, res, next) => {
    const { payload } = req;
    const { token } = payload;

    let data;
    try {
      data = jwt.verify(token, process.env.AUTH_SECRET);
    } catch (e) {
      console.debug('rejecting token since it is invalid');
      return res.status(401).send('Unauthorized: Invalid token');
    }
    const { googleRefreshToken } = data;

    payload.googleRefreshToken = googleRefreshToken;

    return next();
  };
}

exports.authenticate = () => [
  initializePayload(),
  assignToken(),
  assignGoogleRefreshToken(),
];

exports.verifyToken = () => (req, res) => res.status(200).send();
