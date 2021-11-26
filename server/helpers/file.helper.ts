import fs from 'fs';

export function doesFileExist(fileName: string) {
  return fs.existsSync(fileName);
}

export function readJsonFile(fileName: string) {
  const data = fs.readFileSync(fileName).toString();
  return JSON.parse(data);
}

export function writeJsonToFile(fileName: string, data: unknown) {
  const dataStr = JSON.stringify(data, null, 2);
  fs.writeFileSync(fileName, dataStr);
}
