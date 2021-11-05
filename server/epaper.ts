import fs from 'fs';
import os from 'os';
import { WebSocketServer } from 'ws';
import { Page as BrowserPage } from 'puppeteer';
import isPi from 'detect-rpi';

interface EpaperPage {
  browserPage: BrowserPage;
  display(): Promise<void>;
  onConsoleLog(callback: () => void): void;
}

const asyncFs = fs.promises;

const CONFIG_FOLDER = `${os.homedir()}/.agenda-paper`;

async function saveCookies(page: BrowserPage, password: string): Promise<void> {
  const cookies = await page.cookies();
  if (!fs.existsSync(CONFIG_FOLDER)) {
    fs.mkdirSync(CONFIG_FOLDER);
  }
  await asyncFs.writeFile(`${CONFIG_FOLDER}/${password}.json`, JSON.stringify(cookies, null, 2));
}

async function loadCookies(page: BrowserPage, password: string): Promise<boolean> {
  if (fs.existsSync(`${CONFIG_FOLDER}/${password}.json`)) {
    const cookies = await asyncFs.readFile(`${CONFIG_FOLDER}/${password}.json`);
    await page.setCookie(...JSON.parse(cookies.toString()));
    return true;
  }
  return false;
}

export async function startEpaper() {
  if (isPi()) {
    const { devices, init } = await import('epaperjs');

    console.log('initializing epaper');

    const render = (page: EpaperPage, ws: WebSocketServer) => {
      page.onConsoleLog(console.log);

      ws.on('message', async (message) => {
        if (message?.type === 'render') {
          console.debug('loading saved cookies');
          const foundCookies = await loadCookies(page.browserPage, message.password);

          if (foundCookies) {
            console.debug('reploading browser');
            await page.browserPage.reload();
          }

          console.info('starting epaper render');
          await page.display();

          console.debug('saving cookies');
          await saveCookies(page.browserPage, message.password);
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
