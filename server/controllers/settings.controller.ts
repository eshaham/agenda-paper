import { NextFunction, Request, Response } from 'express';

import { APRequest } from '../requests-types';
import { openSockets } from '../open-sockets';
import { initializePayload } from '../middlewares/general.middleware';
import { verifyConfigFolderExists } from '../middlewares/config.middleware';
import { extractSettingsFromBody, loadSettingsFromFile, saveSettingsToFile } from '../middlewares/settings.middleware';

export const getSettings = () => [
  initializePayload(),
  verifyConfigFolderExists(),
  loadSettingsFromFile(),
  async (req: Request, res: Response) => {
    const { payload } = <APRequest>req;
    const { settings } = payload;

    return res.json(settings);
  },
];

const notifySocketsAboutSettingsChange = () => (req: Request, res: Response, next: NextFunction) => {
  openSockets.forEach((socket) => {
    socket.send('settingsChanged');
  });

  next();
};

export const saveSettings = () => [
  initializePayload(),
  extractSettingsFromBody(),
  verifyConfigFolderExists(),
  saveSettingsToFile(),
  notifySocketsAboutSettingsChange(),
  async (req: Request, res: Response) => {
    return res.json({ success: true });
  },
];
