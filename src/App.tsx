import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Home from './containers/Home';
import Setup from './containers/Setup';

function App() {
  return (
    <Box minHeight="100vh" p={4}>
      <Router>
        <Route path="/" exact component={Home} />
        <Route path="/setup" component={Setup} />
      </Router>
    </Box>
  );
}

export default App;
