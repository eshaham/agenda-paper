import { useState } from 'react';
import { Box } from '@mui/material';

import CenterScreen from '../components/CenterScreen';
import LoginForm from '../components/LoginForm';

interface SetupState {
  otp: string;
}

const Setup = () => {
  const [state, setState] = useState<SetupState>({
    otp: '',
  });

  const { otp } = state;

  const onOTPChanged = (newOTP: string) => {
    setState({ ...state, otp: newOTP });
  };

  const onLoginRequested = async () => {
    if (otp) {
      window.location.href = `/api/auth/login?otp=${otp}`;
    }
  };

  return (
    <CenterScreen>
      <Box width={300}>
        <LoginForm otp={otp} onOTPChanged={onOTPChanged} onLoginRequested={onLoginRequested} />
      </Box>
    </CenterScreen>
  );
};

export default Setup;
