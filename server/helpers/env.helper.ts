export function getEnvVariableOrDie(variableName: string): string {
  const variable = process.env[variableName];
  if (variable === undefined) {
    throw new Error(`${variableName} env variable not provided`);
  }
  return variable;
}
