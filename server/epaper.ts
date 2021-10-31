import { WebSocketServer } from 'ws';
import isPi from 'detect-rpi';

interface Page {
  display(): Promise<void>;
  onConsoleLog(callback: () => void): void;
}

export async function startEpaper() {
  if (isPi()) {
    console.log('starting epaper render');
    const { devices, init } = await import('epaperjs');

    console.log('initializing epaper');

    const render = (page: Page, ws: WebSocketServer) => {
      page.onConsoleLog(console.log);

      ws.on('message', async (message) => {
        if (message === 'render') {
          await page.display();
        }
      });
    };

    init(devices.waveshare7in5v2, {
      skipWebServer: true,
      url: 'http://localhost:3000',
      websocketPort: 8081,
    }, render);
  }
}
