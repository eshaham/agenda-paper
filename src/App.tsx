import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Home from './containers/Home';
import Setup from './containers/Setup';
import Settings from './containers/Settings';

function App() {
  return (
    <Box minHeight="100vh">
      <Router>
        <Route path="/" exact component={Home} />
        <Route path="/setup" component={Setup} />
        <Route path="/settings" component={Settings} />
      </Router>
    </Box>
  );
}

export default App;
