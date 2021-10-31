import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

async function verifyAuth() {
  const response = await fetch('/api/auth/verify-token');
  return response.ok;
}

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await verifyAuth();
      if (isAuthenticated) {
        setIsLoggedIn(true);
      }
      setLoading(false);

      const ws = new WebSocket('ws://localhost:8081');
      ws.addEventListener('open', () => {
        ws.send('render');
      });
    };

    init();
  }, []);

  if (loading) {
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
