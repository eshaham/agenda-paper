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
    init(devices.waveshare7in5v2, {
      skipWebServer: true,
    });
  }
};
