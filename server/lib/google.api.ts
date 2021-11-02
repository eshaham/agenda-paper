import { google } from 'googleapis';
import { getEnvVariableOrDie } from '../helpers/env.helper';

const SITE_URL = 'http://localhost:3000';
const API_URL = `${SITE_URL}/api`;
const LOGIN_CALLBACK_URL = `${API_URL}/auth/login/callback`;

function buildGoogleOptions(state: Record<string, unknown>) {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
  ];
  const prompts = ['select_account', 'consent'];

  const options = {
    access_type: 'offline',
    scope: scopes,
    prompt: prompts.join(' '),
    state: JSON.stringify(state),
  };

  return options;
}

function createClient() {
  const GOOGLE_CLIENT_ID = getEnvVariableOrDie('GOOGLE_CLIENT_ID');
  const GOOGLE_CLIENT_SECRET = getEnvVariableOrDie('GOOGLE_CLIENT_SECRET');

  const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, LOGIN_CALLBACK_URL);
  return client;
}

export const createAuthUrl = (otp: string) => {
  const options = buildGoogleOptions({ otp });
  const client = createClient();
  const url = client.generateAuthUrl(options);
  return url;
};

export const convertCodeToRefreshToken = async (code: string) => {
  let refreshToken;
  const client = createClient();
  try {
    const { tokens } = await client.getToken(code);
    refreshToken = tokens.refresh_token;
  } catch (e) {
    const { response: { status, data } = {} } = <{
      response?:{
        status: number,
        data?: { error: string, error_description: string },
      },
    }>e;
    console.error(`failed to convert code to token - status: ${status || ''}, error: ${data?.error || ''}, description: ${data?.error_description || ''}\n`, e);
    throw e;
  }

  return refreshToken;
};
