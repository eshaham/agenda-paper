import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';

const DayOfMonthIcon = ({ ...rest }) => {
  const dayOfMonth = dayjs().date();

  return (
    <Box position="relative" {...rest}>
      <img src="empty_calendar.png" alt="empty calendar" style={{ maxWidth: '100%', maxHeight: '100%' }} />
      <Box position="absolute" top="60%" left="50%" textAlign="center" style={{ transform: 'translate(-50%, -50%)' }}>
        <Typography variant="h3" fontWeight={500}>
          {dayOfMonth}
        </Typography>
      </Box>
    </Box>
  );
};

export default DayOfMonthIcon;
