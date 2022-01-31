import { NextFunction, Request, Response } from 'express';

import { APRequest } from '../requests-types';
import { CONFIG_FOLDER } from '../constants';
import { doesFileExist, readJsonFile, writeJsonToFile } from '../helpers/file.helper';

export interface Settings {
  showLocation?: boolean;
  showFreeEvents?: boolean;
}

const SETTINGS_FILE_NAME = `${CONFIG_FOLDER}/settings.json`;
const INITIAL_SETTINGS: Settings = {
  showLocation: false,
  showFreeEvents: false,
};

export const loadSettingsFromFile = () => async (req: Request, res: Response, next: NextFunction) => {
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

export const extractSettingsFromBody = () => async (req: Request, res: Response, next: NextFunction) => {
  const { body, payload } = <APRequest>req;
  const { showLocation, showFreeEvents } = <Settings>body;

  const settings: Settings = {
    showLocation,
    showFreeEvents,
  };

  payload.settings = settings;

  next();
};

export const saveSettingsToFile = () => async (req: Request, res: Response, next: NextFunction) => {
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
