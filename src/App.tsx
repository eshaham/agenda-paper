import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { Box, ThemeProvider } from '@mui/material';

import Home from './containers/Home';
import Setup from './containers/Setup';
import Settings from './containers/Settings';

let theme = createTheme();
theme = responsiveFontSizes(theme);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box minHeight="100vh">
        <Router>
          <Route path="/" exact component={Home} />
          <Route path="/setup" component={Setup} />
          <Route path="/settings" component={Settings} />
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
