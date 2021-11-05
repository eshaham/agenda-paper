import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import { CalendarEvent } from '../types';

interface DisplayState {
  calendarEvent: CalendarEvent;
  isShownFirst?: boolean;
}

function isoDateToTime(isoDate: string) {
  return dayjs(isoDate).format('HH:mm');
}

const CalendarEventDisplay = ({ calendarEvent, isShownFirst }: DisplayState) => {
  return (
    <Box mb={4}>
      <Typography variant={ isShownFirst ? 'h2' : 'h3' } noWrap>
        {calendarEvent.title}
      </Typography>
      <Typography variant={ isShownFirst ? 'h3' : 'h4' }>
        {isoDateToTime(calendarEvent.start)}-{isoDateToTime(calendarEvent.end)}
      </Typography>
    </Box>
  );
};

export default CalendarEventDisplay;
