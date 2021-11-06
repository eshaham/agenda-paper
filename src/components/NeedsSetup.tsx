import { Box, Typography } from '@mui/material';

import CenterScreen from './CenterScreen';

const NeedsSetup = () => {
  return (
    <CenterScreen fullHeight lineHeight={2}>
      <Box maxWidth={600}>
        <Typography variant="h3">
          To set this up, please go to
        </Typography>
        <Typography variant="h4">
          <pre>http://localhost:3000/setup</pre>
        </Typography>
        <Typography variant="h3">
          using the browser on your Raspberry Pi's desktop
        </Typography>
      </Box>
    </CenterScreen>
  );
};

export default NeedsSetup;
