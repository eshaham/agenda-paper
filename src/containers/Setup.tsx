import { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Button,
  TextField,
  Alert,
} from '@mui/material';

interface SetupVariables {
  clientId?: string;
  clientSecret?: string;
  authSecret?: string;
}

interface SetupState {
  isLoading: boolean;
  clientId: string;
  clientSecret: string;
  authSecret: string;
  isProcessing: boolean;
  error?: string;
}

interface SetupResult {
  success: boolean;
  error?: string;
}

async function loadVariables(): Promise<SetupVariables | null> {
  const response = await fetch('/api/setup');
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return null;
}

async function setupVariables(
  clientId: string,
  clientSecret: string,
  authSecret: string,
): Promise<SetupResult> {
  const body = { clientId, clientSecret, authSecret };
  const request = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await fetch('/api/setup', request);
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return { success: false, error: 'could not setup variables' };
}

const Setup = () => {
  const [state, setState] = useState<SetupState>({
    isLoading: true,
    clientId: '',
    clientSecret: '',
    authSecret: '',
    isProcessing: false,
  });

  useEffect(() => {
    const doLoadVariables = async () => {
      const variables = await loadVariables();
      if (variables) {
        const { clientId, clientSecret, authSecret } = variables;
        setState((state) => ({
          ...state,
          isLoading: false,
          clientId: clientId ?? state.clientId,
          clientSecret: clientSecret ?? state.clientSecret,
          authSecret: authSecret ?? state.authSecret,
        }));
      } else {
        setState((state) => ({
          ...state,
          error: 'could not fetch variables'
        }));
      }
    };
    doLoadVariables();
  }, []);

  const onClientIdChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, clientId: event.target.value });
  };

  const onClientSecretChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, clientSecret: event.target.value });
  };

  const onAuthSecretChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, authSecret: event.target.value });
  };

  const onLoginClicked = async () => {
    const { clientId, clientSecret, authSecret } = state;
    if (clientId && clientSecret && authSecret) {
      setState((state) => ({ ...state, isProcessing: true }));
      const result = await setupVariables(clientId, clientSecret, authSecret);
      if (result.success) {
        window.location.href = '/api/auth/login';
      } else {
        setState((state) => ({ ...state, error: result.error, isProcessing: true }));
      }
    }
  };

  const {
    isLoading,
    clientId,
    clientSecret,
    authSecret,
    isProcessing,
    error
  } = state;
  const canSubmit = !isProcessing && !!clientId && !!clientSecret && !!authSecret;

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" textAlign="center">
      <Box width={600}>
        <Box>
          <TextField
            variant="standard"
            label="Google Client ID"
            value={clientId}
            fullWidth
            margin="normal"
            onChange={onClientIdChanged}
          />
          <TextField
            variant="standard"
            label="Google Client Secret"
            value={clientSecret}
            fullWidth
            margin="normal"
            onChange={onClientSecretChanged}
          />
          <TextField
            variant="standard"
            label="Encryption Auth Secret"
            value={authSecret}
            fullWidth
            margin="normal"
            onChange={onAuthSecretChanged}
          />
        </Box>
        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            disabled={!canSubmit}
            onClick={onLoginClicked}
          >
            Login with Google
          </Button>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    </Box>
  );
};

export default Setup;
