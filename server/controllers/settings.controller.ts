import { NextFunction, Request, Response } from 'express';
import { CONFIG_FOLDER } from '../constants';

import { doesFileExist, readJsonFile, writeJsonToFile } from '../helpers/file.helper';
import { openSockets } from '../open-sockets';
import { verifyConfigFolderExists } from '../middlewares/config.middleware';
import { initializePayload } from '../middlewares/general.middleware';
import { APRequest } from '../requests-types';

interface Settings {
  showLocation: boolean;
}

const SETTINGS_FILE_NAME = `${CONFIG_FOLDER}/settings.json`;
const INITIAL_SETTINGS: Settings = {
  showLocation: false,
};

const loadSettingsFromFile = () => async (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;

  let settings;
  if (doesFileExist(SETTINGS_FILE_NAME)) {
    settings = readJsonFile(SETTINGS_FILE_NAME);
  } else {
    settings = INITIAL_SETTINGS;
    writeJsonToFile(SETTINGS_FILE_NAME, settings);
  }

  payload.settings = settings;

  next();
};

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

const extractSettingsFromBody = () => async (req: Request, res: Response, next: NextFunction) => {
  const { body, payload } = <APRequest>req;
  const { showLocation } = <Settings>body;

  const settings: Settings = {
    showLocation,
  };

  payload.settings = settings;

  next();
};

const saveSettingsToFile = () => async (req: Request, res: Response, next: NextFunction) => {
  const { payload } = <APRequest>req;
  const { settings } = <{ settings: Settings }>payload;

  try {
    writeJsonToFile(SETTINGS_FILE_NAME, settings);
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }

  return next();
};

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
