import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';

import { APRequest } from '../requests-types';
import { initializePayload } from '../middlewares/general.middleware';
import { getEventsBetweenDateTimes } from '../lib/google.api';

const fetchCalendarEvents = () => async (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { googleRefreshToken } = <{ googleRefreshToken: string }>payload;
  const currentTime = dayjs();
  const endOfDay = dayjs(currentTime).endOf('day');
  const calendarEvents = await getEventsBetweenDateTimes(
    googleRefreshToken,
    'primary',
    currentTime.toISOString(),
    endOfDay.toISOString(),
  );

  if (calendarEvents) {
    calendarEvents.forEach((event) => {
      if (event.isPrivate) {
        event.title = 'Private';
      }
    });

    payload.calendarEvents = calendarEvents;
  }

  next();
};

export const getCurrentCalendarEvents = () => [
  initializePayload(),
  fetchCalendarEvents(),
  async (req: Request, res: Response) => {
    const { payload } = <APRequest>req;
    const { calendarEvents } = payload;

    return res.json(calendarEvents);
  },
];
