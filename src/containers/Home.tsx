import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

interface HomeState {
  isLoading: boolean;
  isLoggedIn: boolean;
  otp: number;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function verifyAuth() {
  const response = await fetch('/api/auth/verify-token');
  return response.ok;
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

const Home = () => {
  const [state, setState] = useState<HomeState>({
    isLoading: true,
    isLoggedIn: false,
    otp: getRandomInt(100000, 1000000),
  });

  const { isLoading, isLoggedIn, otp } = state;

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await verifyAuth();
      if (isAuthenticated) {
        setState((state) => ({ ...state, isLoggedIn: true }));
      }
      setState((state) => ({ ...state, isLoading: false }));

      const epaperSocket = new WebSocket('ws://localhost:8081');
      epaperSocket.addEventListener('open', () => {
        epaperSocket.send('render');
      });

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
            epaperSocket.send('render');
          }
        }
      };
    };

    if (isLoading && otp) {
      init();
    }
  }, [otp, isLoading]);

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" textAlign="center">
        <Typography variant="h3">
          To set this up, please go to
          <br />
          http://localhost:3000/setup
          <br />
          using the browser on the raspbian desktop
          <br />
          {otp}
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Typography variant="h1">
        This is Home
      </Typography>
    </Box>
  );
};

export default Home;
