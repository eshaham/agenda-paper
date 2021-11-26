import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, FormControlLabel, FormGroup, Switch, Typography } from '@mui/material';

import CenterScreen from '../components/CenterScreen';
import { SettingsData } from '../types';

interface SettingsState extends SettingsData {
  isLoading: boolean;
  isProcessing: boolean;
  error?: string;
}

interface SetupUpdateResult {
  success: boolean;
  error?: string;
}

async function loadSettings(): Promise<SettingsData | undefined> {
  const response = await fetch('/api/settings');
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return;
}

async function sendSettingsChanges(settings: SettingsData): Promise<SetupUpdateResult> {
  const body = settings;
  const request = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await fetch('/api/settings', request);
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return { success: false, error: 'could not update settings' };
}

const Settings = () => {
  const [state, setState] = useState<SettingsState>({
    isLoading: true,
    isProcessing: false,
    showLocation: false,
  });

  useEffect(() => {
    const doLoadVariables = async () => {
      const settings = await loadSettings();
      if (settings) {
        setState((state) => ({
          ...state,
          ...settings,
          isLoading: false,
        }));
      } else {
        setState((state) => ({
          ...state,
          error: 'could not load settings',
        }));
      }
    };
    doLoadVariables();
  }, []);

  useEffect(() => {
    const doSendSettingsChanges = async () => {
      const { showLocation } = state;
      const result = await sendSettingsChanges({ showLocation });
      if (result.success) {
        setState((state) => ({
          ...state,
          isProcessing: false,
        }));
      } else {
        setState((state) => ({
          ...state,
          error: result.error,
          isProcessing: false,
        }));
      }
    };
    if (state.isProcessing) {
      doSendSettingsChanges();
    }
  }, [state]);

  const onSettingsChanged = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
      isProcessing: true,
      error: undefined,
    });
  };

  const { isLoading, isProcessing, showLocation, error } = state;

  if (isLoading) {
    return (
      <Box p={4}>
        <CenterScreen>
          <CircularProgress />
        </CenterScreen>
      </Box>
    );
  }

  return (
    <CenterScreen>
      <Typography variant="h1">Settings</Typography>
      <FormGroup>
        <FormControlLabel control={
          <Switch
            name="showLocation"
            checked={showLocation}
            disabled={isProcessing}
            onChange={onSettingsChanged}
          />
        } label="Show Event Location" />
      </FormGroup>
      {error && <Alert severity="error">{error}</Alert>}
    </CenterScreen>
  );
};

export default Settings;
