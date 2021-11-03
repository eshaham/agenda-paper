import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

import CenterScreen from '../components/CenterScreen';
import LoginForm from '../components/LoginForm';

interface SetupState {
  isLoading: boolean;
  isLoggedIn: boolean;
  otp: string;
}

async function verifyAuth() {
  const response = await fetch('/api/auth/verify-token');
  return response.ok;
}

const Setup = () => {
  const [state, setState] = useState<SetupState>({
    isLoading: true,
    isLoggedIn: false,
    otp: '',
  });

  const { isLoading, otp, isLoggedIn } = state;

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await verifyAuth();
      if (isAuthenticated) {
        setState((state) => ({ ...state, isLoggedIn: true }));
      }
      setState((state) => ({ ...state, isLoading: false }));
    };

    if (isLoading) {
      init();
    }
  }, [isLoading]);

  const onOTPChanged = (newOTP: string) => {
    setState({ ...state, otp: newOTP });
  };

  const onLoginRequested = async () => {
    const { otp } = state;

    if (otp) {
      window.location.href = `/api/auth/login?otp=${otp}`;
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <CenterScreen>
      <Box width={300}>
        {!isLoggedIn && (
          <LoginForm otp={otp} onOTPChanged={onOTPChanged} onLoginRequested={onLoginRequested} />
        )}
      </Box>
    </CenterScreen>
  );
};

export default Setup;
