import { Box, Button } from '@mui/material';

import CenterScreen from '../components/CenterScreen';

const Setup = () => {
  const onLoginRequested = async () => {
    window.location.href = `/api/auth/login`;
  };

  return (
    <CenterScreen fullHeight>
      <Box width={300}>
        <Button
          variant="contained"
          color="primary"
          onClick={onLoginRequested}
        >
          Login with Google
        </Button>
      </Box>
    </CenterScreen>
  );
};

export default Setup;
