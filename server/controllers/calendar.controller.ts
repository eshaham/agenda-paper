import moment from 'moment';
import { NextFunction, Request, Response } from 'express';

import { APRequest } from '../requests-types';
import { initializePayload } from '../middlewares/general.middleware';
import { getEventsBetweenDateTimes } from '../lib/google.api';

const fetchCalendarEvents = () => async (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { googleRefreshToken } = <{ googleRefreshToken: string }>payload;
  const startMoment = moment();
  const endMoment = moment(startMoment).endOf('day');
  const calendarEvents = await getEventsBetweenDateTimes(
    googleRefreshToken,
    'primary',
    startMoment.toISOString(),
    endMoment.toISOString(),
  );

  payload.calendarEvents = calendarEvents;

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
