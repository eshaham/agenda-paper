const { devices, init } = require('epaperjs');

module.exports = function(app) {
  console.log('initializing epaper');
  init(devices.waveshare7in5v2, {
    skipWebServer: true,
  });
};
