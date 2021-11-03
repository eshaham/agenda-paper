import { Box, Button, TextField } from '@mui/material';

const LoginForm = ({ otp, onOTPChanged, onLoginRequested }: {
  otp: string,
  onOTPChanged: (otp: string) => void,
  onLoginRequested: () => void,
}) => {
  return (
    <Box width={300}>
      <Box>
        <TextField
          variant="standard"
          label="Code"
          value={otp}
          margin="normal"
          helperText="Copy the code shown on your ePaper display"
          onChange={(event) => onOTPChanged(event.target.value)}
        />
      </Box>
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={onLoginRequested}
        >
          Login with Google
        </Button>
      </Box>
    </Box>
  );
};

export default LoginForm;
