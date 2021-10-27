const isPi = require('detect-rpi');

module.exports = function(app) {
  if (isPi()) {
    const { devices, init } = require('epaperjs');

    console.log('initializing epaper');
    init(devices.waveshare7in5v2, {
      skipWebServer: true,
    });
  }
};
