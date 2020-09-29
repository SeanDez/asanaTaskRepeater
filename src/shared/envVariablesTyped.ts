import fs from 'fs';
import path from 'path';

const projectRootFolder = path.join(__dirname, '../../');
const envFilePath = path.join(projectRootFolder, '.env');

// slurp the whole file as a long string
// split by new line
const fileContents = fs.readFileSync(envFilePath, { encoding: 'utf8' });
const fileContentsByLine = fileContents.split(/\n/);

// kick out bad lines
const kVPairStrings = fileContentsByLine.filter((line: string) => {
  if (line === '' || /^#/.test(line)) {
    return false;
  }

  return true;
});

// key each kv pair to an object property
const envVariables: { [k: string]: string } = {};
kVPairStrings.forEach((kVPairString: string) => {
  const arrayPair = kVPairString.split('=');
  const [envKey, envValue] = arrayPair;
  envVariables[envKey] = envValue;
});

// console.log('envVariables', envVariables);

// throw if no env variables
const numberOfEnvKeys = Object.keys(envVariables).length;
if (numberOfEnvKeys === 0) {
  throw new Error('.env file either missing or has no key/value pairs');
}

export default envVariables;
