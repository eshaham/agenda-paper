import { Auth, google, calendar_v3 } from 'googleapis';

import { getEnvVariableOrDie } from '../helpers/env.helper';

interface Response<T> {
  status: number;
  statusText: string;
  data: T;
}

export interface CalendarInfo {
  id: string;
  isPrimary: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  isPrivate: boolean;
}

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

function createClient(googleRefreshToken?: string) {
  const GOOGLE_CLIENT_ID = getEnvVariableOrDie('GOOGLE_CLIENT_ID');
  const GOOGLE_CLIENT_SECRET = getEnvVariableOrDie('GOOGLE_CLIENT_SECRET');

  const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, LOGIN_CALLBACK_URL);
  if(googleRefreshToken) {
    const credentials = {
      refresh_token: googleRefreshToken,
    };
    client.setCredentials(credentials);
  }
  return client;
}

function handleResponse<T>(response: Response<T>, allowedCodes?: Array<number>): T | undefined {
  if (response.status !== 200 && (!allowedCodes || !allowedCodes.includes(response.status))) {
    console.error(`google api unsuccessfull: ${response.status} - ${response.statusText}`);
    return undefined;
  }

  return response.data;
}

function logError(e: unknown, operation: string) {
  console.error(`error while making ${operation} google api call:\n`, e);
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

function getCalendarService(client: Auth.OAuth2Client) {
  return google.calendar({ version: 'v3', auth: client });
}

function rawCalendarsToCalendars(
  rawCalendars: Array<calendar_v3.Schema$CalendarListEntry>,
): Array<CalendarInfo> {
  return rawCalendars.map((rawCalendar) => ({
    id: <string>rawCalendar.id,
    isPrimary: !!rawCalendar.primary,
  }));
}

export const getCalendars = async (
  googleRefreshToken: string,
): Promise<Array<CalendarInfo> | undefined> => {
  const client = createClient(googleRefreshToken);
  const service = getCalendarService(client);
  try {
    const response = await service.calendarList.list();
    const result = handleResponse(response);
    return result && result.items ? rawCalendarsToCalendars(result.items) : undefined;
  } catch (e) {
    logError(e, 'get calendars');
    throw e;
  }
};

async function getEventsByQuery(
  client: Auth.OAuth2Client,
  query: calendar_v3.Params$Resource$Events$List,
): Promise<calendar_v3.Schema$Events | undefined> {
  const service = getCalendarService(client);
  const response = await service.events.list(query);
  return handleResponse(response);
}

function rawEventsToCalendarEvents(rawEvents: Array<calendar_v3.Schema$Event>): Array<CalendarEvent> {
  return rawEvents.map((rawEvent) => {
    const startDateTime = <string>(rawEvent.start || {}).dateTime;
    const endDateTime = <string>(rawEvent.end || {}).dateTime;
    return {
      id: <string>rawEvent.id,
      title: <string>rawEvent.summary,
      start: startDateTime,
      end: endDateTime,
      isPrivate: rawEvent.visibility === 'private',
    };
  });
}

export const getEventsBetweenDateTimes = async (
  googleRefreshToken: string,
  calendarId: string,
  startDateTime: string,
  endDateTime: string,
): Promise<Array<CalendarEvent> | undefined> => {
  const client = createClient(googleRefreshToken);
  const query: calendar_v3.Params$Resource$Events$List = {
    calendarId,
    timeMin: startDateTime,
    timeMax: endDateTime,
    singleEvents: true,
    orderBy: 'startTime',
  };
  try {
    const result = await getEventsByQuery(client, query);
    if (!result || !result.items) {
      return undefined;
    }
    return rawEventsToCalendarEvents(result.items);
  } catch (e) {
    logError(e, 'events query');
    throw e;
  }
};
