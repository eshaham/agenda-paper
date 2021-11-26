import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import { CONFIG_FOLDER } from '../constants';

export const verifyConfigFolderExists = () => async (req: Request, res: Response, next: NextFunction) => {
  if (!fs.existsSync(CONFIG_FOLDER)) {
    fs.mkdirSync(CONFIG_FOLDER);
  }

  next();
};
