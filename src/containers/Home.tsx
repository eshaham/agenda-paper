import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

import { CalendarEvent } from '../types';
import NeedsSetup from '../components/NeedsSetup';
import CenterScreen from '../components/CenterScreen';
import CalendarEventDisplay from '../components/CalendarEvent';
import DayOfMonthIcon from '../components/DayOfMonthIcon';

interface HomeState {
  isLoading: boolean;
  isLoggedIn: boolean;
  otp: number;
  epaperSocket?: WebSocket;
  calendarEvents?: Array<CalendarEvent>;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function verifyAuth(): Promise<{ isLoggedIn: boolean, password?: string }> {
  const response = await fetch('/api/auth/verify-token');
  if (response.ok) {
    const data = response.json();
    const { password } = await data;
    return { isLoggedIn: true, password };
  }
  return { isLoggedIn: false };
}

async function associateUser(otp: number, password: string) {
  const body = { otp, password };
  const request = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await fetch('/api/auth/associate', request);
  return response.ok;
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
    otp: getRandomInt(100000, 1000000),
  });

  const {
    isLoading,
    isLoggedIn,
    otp,
    calendarEvents,
    epaperSocket,
  } = state;

  useEffect(() => {
    const init = async () => {
      const result = await verifyAuth();
      const { isLoggedIn, password } = result;
      setState((state) => ({ ...state, isLoggedIn, isLoading: false }));

      const epaperSocket = new WebSocket('ws://localhost:8081');
      epaperSocket.addEventListener('open', () => {
        const msg = { type: 'render', password };
        epaperSocket.send(JSON.stringify(msg));
      });
      setState((state) => ({ ...state, epaperSocket }));

      const serverSocket = new WebSocket('ws://localhost:3000/ws');
      serverSocket.onopen = (e) => {
        serverSocket.send(JSON.stringify({ otp }));
      };
      serverSocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'loggedIn') {
          const { password } = data;
          const isAssociated = await associateUser(otp, password);
          if (isAssociated) {
            setState((state) => ({ ...state, isLoggedIn: true }));
            const msg = { type: 'render', password };
            epaperSocket.send(JSON.stringify(msg));
          }
        }
      };
    };

    if (isLoading && otp) {
      init();
    }
  }, [otp, isLoading]);

  useEffect(() => {
    const initFetchEvents = async () => {
      const calendarEvents = await getCalendarEvents();
      setState((state) => ({ ...state, calendarEvents }));
      if (epaperSocket && epaperSocket.readyState === WebSocket.OPEN) {
        epaperSocket.send('render');
      }
    };
    if (isLoggedIn) {
      initFetchEvents();
    }
  }, [isLoggedIn, epaperSocket]);

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return <NeedsSetup otp={otp} />;
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
    <>
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
    </>
  );
};

export default Home;
