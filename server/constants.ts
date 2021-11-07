import os from 'os';

export const CONFIG_FOLDER = `${os.homedir()}/.agenda-paper`;
export const ENV_FILE_PATH = `${CONFIG_FOLDER}/.env`;
export const TOKEN_FILE_PATH = `${CONFIG_FOLDER}/.token`;
