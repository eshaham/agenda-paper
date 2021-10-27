import { useEffect, useState } from 'react';
import './Home.css';

async function verifyAuth() {
  const response = await fetch('/api/auth/verify-token');
  return response.ok;
}

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = await verifyAuth();
      if (isAuthenticated) {
        setIsLoggedIn(true);
      }
      setLoading(false);

      const ws = new WebSocket('ws://localhost:8080');
      ws.addEventListener('open', () => {
        ws.send('render');
      });
      ws.addEventListener('refresh', () => {
        ws.send('render');
      });
    }

    init();
  }, []);

  if (loading) {
    return null;
  }

  if (!isLoggedIn) {
    const loginUrl = 'http://localhost:3000/login'
    return (
      <p>
        To log in, please go to <a href={loginUrl}>{loginUrl}</a> on the raspbian desktop
      </p>
    );
  }

  return (
    <div className="Home">
      <header className="Home-header">
        <p>
          This is a working Home
        </p>
      </header>
    </div>
  );
}

export default Home;
