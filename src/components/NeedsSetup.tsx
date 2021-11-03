import { Box, Typography } from '@mui/material';

const NeedsSetup = ({ otp }: { otp: number }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      minHeight="100vh"
      lineHeight={2}
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
    </Box>
  );
};

export default NeedsSetup;
