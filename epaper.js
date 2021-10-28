const isPi = require('detect-rpi');

if (isPi()) {
  const { devices, init } = require('epaperjs');

  console.log('initializing epaper');

  const render = (page, ws) => {
    page.onConsoleLog(console.log);

    ws.on('message', async (message) => {
      if (message === 'render') {
        await page.display();
      }
    });

    setInterval(() => {
      console.log('refreshing');
      ws.send('refresh');
    }, 30000);
  };

  init(devices.waveshare7in5v2, {
    skipWebServer: true,
    url: 'http://localhost:3000',
  }, render);
}