import { useEffect, useState } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

import { CalendarEvent, SettingsData } from '../types';
import NeedsSetup from '../components/NeedsSetup';
import CenterScreen from '../components/CenterScreen';
import CalendarEventDisplay from '../components/CalendarEvent';
import DayOfMonthIcon from '../components/DayOfMonthIcon';
import dayjs from 'dayjs';
import useInterval from '../hooks/use-interval';
import { callWithRetry } from '../helpers/error.helper';

interface HomeState {
  isLoading: boolean;
  isLoggedIn: boolean;
  autoFetchInterval: number;
  epaperSocket?: WebSocket;
  settings?: SettingsData;
  calendarEvents?: Array<CalendarEvent>;
}

const INITIAL_FETCH_INTERVAL = 1000;
const FETCH_INTERVAL_MINS = 15;
const FETCH_INTERVAL = FETCH_INTERVAL_MINS * 60 * 1000;

async function verifyLoggedIn(): Promise<boolean> {
  const response = await fetch('/api/auth/login-status');
  if (response.ok) {
    const data = await response.json();
    const { isLoggedIn } = data;
    return isLoggedIn;
  }
  return false;
}

async function loadSettings(): Promise<SettingsData | undefined> {
  const response = await fetch('/api/settings');
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return;
}

async function getCalendarEvents(): Promise<Array<CalendarEvent> | undefined> {
  const response = await fetch('/api/calendar/events');
  if(response.ok) {
    const events = await response.json();
    return events;
  }
  return undefined;
}

function areCalendarListsEqual(list1: Array<CalendarEvent>, list2: Array<CalendarEvent>): boolean {
  return JSON.stringify(list1) === JSON.stringify(list2);
}

function calcNextTickTime(currentTime: dayjs.Dayjs) {
  const currentMinute = currentTime.minute();
  const nextTickMinute = (currentMinute + FETCH_INTERVAL_MINS - (currentMinute % FETCH_INTERVAL_MINS)) % 60;
  const nextTickTime = currentTime.minute(nextTickMinute).second(0);
  if (nextTickMinute < currentMinute) {
    nextTickTime.add(1, 'hour');
  }
  return nextTickTime;
}

const Home = () => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'));

  const [state, setState] = useState<HomeState>({
    isLoading: true,
    isLoggedIn: false,
    autoFetchInterval: INITIAL_FETCH_INTERVAL,
  });

  const {
    isLoading,
    isLoggedIn,
    autoFetchInterval,
    settings,
    calendarEvents,
    epaperSocket,
  } = state;

  useEffect(() => {
    const init = async () => {
      const settings = await callWithRetry(loadSettings);
      const isLoggedIn = await verifyLoggedIn();
      setState((state) => ({ ...state, settings, isLoggedIn, isLoading: false }));

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
        if (event.data === 'settingsChanged') {
          const settings = await loadSettings();
          setState((state) => ({ ...state, settings }));
        }
      };
    };

    if (isLoading) {
      init();
    }
  }, [isLoading]);

  useInterval(
    async () => {
      if (isLoggedIn) {
        const currentTime = dayjs();
        if (autoFetchInterval === INITIAL_FETCH_INTERVAL || currentTime.minute() % FETCH_INTERVAL_MINS !== 0) {
          const nextTickTime = calcNextTickTime(currentTime);
          setState((state) => ({ ...state, autoFetchInterval: nextTickTime.diff(currentTime) }));
        } else if (autoFetchInterval !== FETCH_INTERVAL) {
          setState((state) => ({ ...state, autoFetchInterval: FETCH_INTERVAL }));
        }

        try {
          const newCalendarEvents = await callWithRetry(getCalendarEvents);
          if (!calendarEvents || (newCalendarEvents && !areCalendarListsEqual(calendarEvents.slice(0, 3), newCalendarEvents.slice(0, 3)))) {
            setState((state) => ({ ...state, calendarEvents: newCalendarEvents }));
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
    autoFetchInterval,
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
        <CalendarEventDisplay
          calendarEvent={calendarEvents[0]}
          showLocation={settings?.showLocation}
          isShownFirst
        />
      </Box>
      <Box display="flex">
        {isLargeScreen && (
          <Box width={110} flexShrink={0} mr={6}>
            <DayOfMonthIcon />
          </Box>
        )}
        <Box flex={6} overflow="hidden">
          {calendarEvents[1] && (
            <CalendarEventDisplay
              calendarEvent={calendarEvents[1]}
              showLocation={settings?.showLocation}
            />
          )}
          {calendarEvents[2] && !settings?.showLocation && isLargeScreen && (
            <Box>
              <CalendarEventDisplay
                calendarEvent={calendarEvents[2]}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
