import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

import { CalendarEvent } from '../types';
import NeedsSetup from '../components/NeedsSetup';
import CenterScreen from '../components/CenterScreen';
import CalendarEventDisplay from '../components/CalendarEvent';
import DayOfMonthIcon from '../components/DayOfMonthIcon';
import dayjs from 'dayjs';
import useInterval from '../hooks/use-interval';

interface HomeState {
  isLoading: boolean;
  isLoggedIn: boolean;
  isAutoFetchOn: boolean;
  epaperSocket?: WebSocket;
  calendarEvents?: Array<CalendarEvent>;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyLoggedIn(): Promise<boolean> {
  const response = await fetch('/api/auth/login-status');
  if (response.ok) {
    const data = await response.json();
    const { isLoggedIn } = data;
    return isLoggedIn;
  }
  return false;
}

async function getCalendarEvents(): Promise<Array<CalendarEvent> | undefined> {
  const response = await fetch('/api/calendar/events');
  if(response.ok) {
    const events = await response.json();
    return events;
  }
  return undefined;
}

const Home = () => {
  const [state, setState] = useState<HomeState>({
    isLoading: true,
    isLoggedIn: false,
    isAutoFetchOn: false,
  });

  const {
    isLoading,
    isLoggedIn,
    isAutoFetchOn,
    calendarEvents,
    epaperSocket,
  } = state;

  useEffect(() => {
    const init = async () => {
      const isLoggedIn = await verifyLoggedIn();
      setState((state) => ({ ...state, isLoggedIn, isLoading: false }));

      const epaperSocket = new WebSocket('ws://localhost:8081');
      epaperSocket.addEventListener('open', () => {
        epaperSocket.send('render');
      });
      setState((state) => ({ ...state, epaperSocket }));

      const serverSocket = new WebSocket('ws://localhost:3000/ws');
      serverSocket.onopen = (e) => {
        serverSocket.send('listen');
      };
      serverSocket.onmessage = async (event) => {
        if (event.data === 'loggedIn') {
          const isLoggedIn = await verifyLoggedIn();
          setState((state) => ({ ...state, isLoggedIn }));
        }
      };
    };

    if (isLoading) {
      init();
    }
  }, [isLoading]);

  const fetchEvents = async () => {
    console.log(`${dayjs().format('HH:mm')}: fetching events`);
    const calendarEvents = await getCalendarEvents();
    setState((state) => ({ ...state, calendarEvents }));
  };

  useEffect(() => {
    const startFetchingEvents = async () => {
      await fetchEvents();

      const roundedUp = Math.ceil(dayjs().minute() / 15) * 15;
      const next15Time = dayjs().minute(roundedUp).second(0);
      await sleep(next15Time.diff(dayjs()));

      setState((state) => ({ ...state, isAutoFetchOn: true }));

      await fetchEvents();
    };
    if (isLoggedIn) {
      startFetchingEvents();
    }
  }, [isLoggedIn]);

  useInterval(
    fetchEvents,
    isAutoFetchOn ? 15 * 60 * 1000 : null,
  );

  useEffect(() => {
    if (calendarEvents && epaperSocket && epaperSocket.readyState === WebSocket.OPEN) {
      epaperSocket.send('render');
    }
  }, [calendarEvents, epaperSocket]);

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return <NeedsSetup />;
  }

  if (!calendarEvents) {
    return null;
  }

  if (!calendarEvents.length) {
    return (
      <CenterScreen>
        <Box mb={6}>
          <Typography variant="h1">
            No upcoming events
          </Typography>
        </Box>
        <Box>
          <DayOfMonthIcon height={100} />
        </Box>
      </CenterScreen>
    );
  }

  return (
    <Box p={4}>
      <Box mb={4}>
        <CalendarEventDisplay calendarEvent={calendarEvents[0]} isShownFirst />
      </Box>
      <Box display="flex">
        <Box width={110} flexShrink={0} mr={6}>
          <DayOfMonthIcon />
        </Box>
        <Box flex={6} overflow="hidden">
          {calendarEvents[1] && <CalendarEventDisplay calendarEvent={calendarEvents[1]} />}
          {calendarEvents[2] && <CalendarEventDisplay calendarEvent={calendarEvents[2]} />}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
