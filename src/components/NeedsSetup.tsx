import { Box, Typography } from '@mui/material';

import CenterScreen from './CenterScreen';

const NeedsSetup = ({ otp }: { otp: number }) => {
  return (
    <CenterScreen fullHeight lineHeight={2}
    >
      <Box maxWidth={600}>
        <Typography variant="h4">
          To set this up, please go to
          <pre>http://localhost:3000/setup</pre>
          using the browser on your Raspberry Pi's desktop
          <br />
          <br />
          Code to use:
          <br />
          {otp}
        </Typography>
      </Box>
    </CenterScreen>
  );
};

export default NeedsSetup;
