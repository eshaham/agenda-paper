import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './containers/Home';
import Login from './containers/Login';

function App() {
  return (
    <Router>
      <Route path="/" exact component={Home} />
      <Route path="/login" component={Login} />
    </Router>
  );
}

export default App;
