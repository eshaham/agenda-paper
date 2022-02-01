import dayjs from 'dayjs';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CalendarEvent } from '../types';

interface DisplayParams {
  calendarEvent: CalendarEvent;
  showLocation?: boolean;
  isShownFirst?: boolean;
}

function isoDateToTime(isoDate: string) {
  return dayjs(isoDate).format('HH:mm');
}

const CalendarEventDisplay = ({ calendarEvent, showLocation, isShownFirst }: DisplayParams) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Box mb={4}>
      <Typography component="h2" variant={isShownFirst && isLargeScreen ? 'h2' : 'h3' } fontWeight={700} lineHeight={1.4} noWrap>
        {calendarEvent.title}
      </Typography>
      <Typography component="h3" variant={isShownFirst || !isLargeScreen ? 'h3' : 'h4' } fontWeight={700} noWrap>
        {isoDateToTime(calendarEvent.start)}-{isoDateToTime(calendarEvent.end)}
      </Typography>
      {showLocation && isLargeScreen && (
        <Box>
          <Typography variant="h4" fontWeight={500} noWrap>
            {calendarEvent.location}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CalendarEventDisplay;
