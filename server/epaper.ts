import { WebSocketServer } from 'ws';
import { Page as BrowserPage } from 'puppeteer';
import isPi from 'detect-rpi';

interface EpaperPage {
  browserPage: BrowserPage;
  display(): Promise<void>;
  onConsoleLog(callback: () => void): void;
}

export async function startEpaper() {
  if (isPi()) {
    const { devices, init } = await import('epaperjs');

    console.log('initializing epaper');

    const render = (page: EpaperPage, ws: WebSocketServer) => {
      page.onConsoleLog(console.log);

      ws.on('message', async (msg) => {
        if (msg === 'render') {
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
