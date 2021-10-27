const { google } = require('googleapis');

const SITE_URL = 'http://localhost:3000';
const API_URL = `${SITE_URL}/api`;
const LOGIN_CALLBACK_URL = `${API_URL}/auth/login/callback`;

function buildGoogleOptions() {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
  ];
  const prompts = ['select_account', 'consent'];

  const options = {
    access_type: 'offline',
    scope: scopes,
    prompt: prompts.join(' '),
  };

  return options;
}

function createClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const client = new google.auth.OAuth2(clientId, clientSecret, LOGIN_CALLBACK_URL);
  return client;
}

exports.createAuthUrl = () => {
  const options = buildGoogleOptions();
  const client = createClient();
  const url = client.generateAuthUrl(options);
  return url;
}

exports.convertCodeToRefreshToken = async (code) => {
  let refreshToken;
  try {
    const client = createClient();
    const { tokens } = await client.getToken(code);
    if (tokens.error) {
      throw new Error('failed to create tokens\n', tokens.error);
    }
    refreshToken = tokens.refresh_token;
  } catch (e) {
    console.error(`failed to convert code to token - status: ${e.response?.status}, error: ${e.response?.data?.error}, description: ${e.response?.data?.error_description}\n`, e);
    throw e;
  }

  return refreshToken;
};
