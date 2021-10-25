import React, { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.addEventListener('open', () => {
        ws.send('render');
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          This is working
        </p>
      </header>
    </div>
  );
}

export default App;
