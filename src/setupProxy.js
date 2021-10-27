const cookieParser = require('cookie-parser');
const isPi = require('detect-rpi');

const routes = require('../server/routes');

require('dotenv').config();

module.exports = function(app) {
  app.use(cookieParser());

  app.use('/api', routes);

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

      setInterval(() => ws.send('refresh'), 30000);
    };

    init(devices.waveshare7in5v2, {
      skipWebServer: true,
      url: 'http://localhost:3000',
    }, render);
  }
};
