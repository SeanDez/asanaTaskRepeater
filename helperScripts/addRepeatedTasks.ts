import { createMissing } from '../src/cronjobs/duplicateTasksForAll';
import TokenHandler from '../src/authTokenHandling/TokenHandler';

import envTyped from '../src/shared/envVariablesTyped';

const { ASANA_TEST_ACCOUNT_EMAIL } = envTyped;

/* eslint-disable */

/*
  This script puts some repeated tasks into asana using the user credentials defined in the env file

  It's needed because asana doesn't allow tagging from the front end, which means the API is the only way to create a set of test repeated tasks
*/

const tokenHandler = new TokenHandler(ASANA_TEST_ACCOUNT_EMAIL);

// these tasks stand independent of the original
// they only need the original for time referencing
const tasksToAdd = [
// {
//   name: string;
//   gid?: string;
//   notes: string;
//   tags: string[];
//   projects?: string[];
//   due_on: string;
//   alreadyRepeated: boolean;
//   repeatTimeStamp: string;
// }, 
{
  name: 'ficticious task',
  gid?: 'no gid',
  notes: 'notes for a task that is not real',
  tags: string['repeated:2020-10-18T00:00:00+07:00'],
  projects?: 'General Tasks',
  due_on: '2020-11-01T00:00:00+07:00',
  alreadyRepeated: false,
  repeatTimeStamp: '2020-10-24T00:00:00+07:00',
}

];

// ----------------- create tasks

(async () => {
  try {
    const verifiedToken = await tokenHandler
    createMissing()

  } catch (error) {
    throw new Error(error);
  }
})();


// create a few repeated tasks