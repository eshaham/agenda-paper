import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import { CalendarEvent } from '../types';

interface DisplayState {
  calendarEvent: CalendarEvent;
  showLocation?: boolean;
  isShownFirst?: boolean;
}

function isoDateToTime(isoDate: string) {
  return dayjs(isoDate).format('HH:mm');
}

const CalendarEventDisplay = ({ calendarEvent, showLocation, isShownFirst }: DisplayState) => {
  return (
    <Box mb={4}>
      <Typography variant={ isShownFirst ? 'h2' : 'h3' } fontWeight={700} noWrap>
        {calendarEvent.title}
      </Typography>
      <Typography variant={ isShownFirst ? 'h3' : 'h4' } fontWeight={500}>
        {isoDateToTime(calendarEvent.start)}-{isoDateToTime(calendarEvent.end)}
      </Typography>
      {showLocation && (
        <Box minHeight={32}>
          <Typography variant={ isShownFirst ? 'h4' : 'h5' } fontWeight={500} noWrap>
            {calendarEvent.location}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CalendarEventDisplay;
