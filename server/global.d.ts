declare module 'detect-rpi' {
  export default function isPi(): boolean;
}

declare module 'epaperjs' {
  type WaveshareDevice = unknown;
  interface Config {}
  type RenderFunction = (page: Page, ws: WebSocketServer) => void;

  export const devices: {
    [key: string]: WaveshareDevice,
    waveshare4in2: WaveshareDevice,
    waveshare4in2Horizontal: WaveshareDevice,
    waveshare4in2HorizontalGray: WaveshareDevice,
    waveshare4in2Vertical: WaveshareDevicev,
    waveshare4in2VerticalGray: WaveshareDevice,
    waveshare7in5v2: WaveshareDevice,
    waveshare7in5v2Horizontal: WaveshareDevice,
    waveshare7in2v2Vertical: WaveshareDevice,
    waveshare3in7: WaveshareDevice,
    waveshare3in7Horizontal: WaveshareDevice,
    waveshare3in7HorizontalGray: WaveshareDevice,
    waveshare3in7Vertical: WaveshareDevice,
    waveshare3in7VerticalGray: WaveshareDevice,
    waveshare2in13v2: WaveshareDevice,
    waveshare2in13v2Horizontal: WaveshareDevice,
    waveshare2in13v2Vertical: WaveshareDevice,
    waveshare2in13bcHorizontal: WaveshareDevice,
    waveshare2in13bcVertical: WaveshareDevice,
    waveshare2in13bc: WaveshareDevice,
  };

  export function init(device: WaveshareDevice, config: Config, render: RenderFunction);
}
