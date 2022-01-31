import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';

import { APRequest } from '../requests-types';
import { getEventsBetweenDateTimes } from '../lib/google.api';
import { callWithRetry } from '../helpers/error.helper';
import { initializePayload } from '../middlewares/general.middleware';
import { loadSettingsFromFile, Settings } from '../middlewares/settings.middleware';

async function getCurrentEventsFromCalendar(googleRefreshToken: string) {
  const currentTime = dayjs();
  const endOfDay = dayjs(currentTime).endOf('day');
  console.info(`${currentTime.format('HH:mm')}: fetching events`);
  const calendarEvents = await callWithRetry(
    () => getEventsBetweenDateTimes(
      googleRefreshToken,
      'primary',
      currentTime.toISOString(),
      endOfDay.toISOString(),
    ),
  );
  return calendarEvents;
}

const fetchCalendarEvents = () => async (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { googleRefreshToken, settings } = <{ googleRefreshToken: string, settings: Settings }>payload;
  const { showFreeEvents, maskPrivateEvents } = settings;

  let calendarEvents = await getCurrentEventsFromCalendar(googleRefreshToken);

  if (calendarEvents) {
    if (maskPrivateEvents) {
      calendarEvents.forEach((event) => {
        if (event.isPrivate) {
          event.title = 'Private';
        }
      });
    }

    if (!showFreeEvents) {
      calendarEvents = calendarEvents.filter((event) => !event.isFree);
    }

    payload.calendarEvents = calendarEvents;
  }

  next();
};

export const getCurrentCalendarEvents = () => [
  initializePayload(),
  loadSettingsFromFile(),
  fetchCalendarEvents(),
  async (req: Request, res: Response) => {
    const { payload } = <APRequest>req;
    const { calendarEvents } = payload;

    return res.json(calendarEvents);
  },
];
