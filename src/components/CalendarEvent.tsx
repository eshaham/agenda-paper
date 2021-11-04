import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import { CalendarEvent } from '../types';

function isoDateToTime(isoDate: string) {
  return dayjs(isoDate).format('HH:mm');
}

const CalendarEventDisplay = ({ calendarEvent }: { calendarEvent: CalendarEvent }) => {
  return (
    <Box>
      <Typography variant="h3">
        {calendarEvent.title}
      </Typography>
      <Typography variant="h5">
        {isoDateToTime(calendarEvent.start)}-{isoDateToTime(calendarEvent.end)}
      </Typography>
    </Box>
  );
};

export default CalendarEventDisplay;
