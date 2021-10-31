import fs from 'fs';

export function getEnvVariableOrDie(variableName: string): string {
  const variable = process.env[variableName];
  if (variable === undefined) {
    throw new Error(`${variableName} env variable not provided`);
  }
  return variable;
}

export function updateEnvFile(fileName: string, variableNames: Array<string>) {
  const envContents = variableNames
    .map(item => `${item}=${process.env[item]}`)
    .join('\n');
  fs.writeFileSync(fileName, envContents);
}
