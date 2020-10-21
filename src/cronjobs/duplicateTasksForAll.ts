import buildUrl from 'build-url';
import { pgConfigured } from '../shared/database';
import { apiUrlBase } from '../shared/globals';
import envTyped from '../shared/envVariablesTyped';

import IRepeatRules from '../shared/interfaces/IRepeatRules';
import ITask from '../shared/interfaces/ITask';
import TokenHandler from '../authTokenHandling/TokenHandler';

interface ITaskWithRepeatTimeStamp extends ITask {
  alreadyRepeated: boolean;
  repeatTimeStamp: string;
}

interface UserCredentials {
  local_id: number;
  asana_email: string;
  gid: string;
  refresh_token_encrypted: string;
  access_token_encrypted: string;
}

interface UserTasksRules {
  userCredentials: UserCredentials,
  rules: IRepeatRules[],
  unfilteredTasks: ITask[],
  repeatedTasks?: ITask[]
}

interface ProjectWithTokenAndRepeatedTasks {
  projectGid: string,
  verifiedAccessToken: string,
  repeatedTasks: ITaskWithRepeatTimeStamp[],
}

// handles all task duplication
export async function repeatTasksForAll() {
  try {
    const allUserCredentials: UserCredentials[] = await getEveryonesUserCredentials();

    const repeatedTasks2dUnres = allUserCredentials
      .map(async (userCredentials: UserCredentials) => {
        const { local_id, asana_email } = userCredentials;

        // get all repeat rules
        const repeatRules: IRepeatRules[] = await getRules(local_id);

        // X get all project gids  // repeatRules.project_gid

        // get all tasks with matching projectGid and access token
        // retain only tasks that have been repeated
        const tasksByProjectPromises = repeatRules.map(async ({ project_gid }: IRepeatRules) => {
          const tokenHandler = new TokenHandler(asana_email);
          const verifiedAccessToken = await tokenHandler.getValidAuthToken();

          const allRepeatedTasksReshaped: ITaskWithRepeatTimeStamp[] = await fetchTasks(project_gid,
            verifiedAccessToken, filterOutUnrepeatedTasks);

          // key to a project gid
          const tasksAndprojectGid: ProjectWithTokenAndRepeatedTasks = {
            projectGid: project_gid,
            verifiedAccessToken,
            repeatedTasks: allRepeatedTasksReshaped,
          };

          return allRepeatedTasksReshaped;
        });

        const tasksByProject = await Promise.all(tasksByProjectPromises);

        
      });
  } catch (error) {
    throw new Error(error);
  }
}

/* Gets the user credentials for every user in the database
*/
async function getEveryonesUserCredentials(): Promise<UserCredentials[]> {
  const getAllUserCredsQuery = 'SELECT local_id, gid, asana_email,refresh_token_encrypted, access_token_encrypted FROM app_user;';

  try {
    const allUserCredentials = await pgConfigured.manyOrNone(getAllUserCredsQuery);
    return allUserCredentials;
  } catch (error) {
    throw new Error(error);
  }
}

/* Gets all repeat rules for a single user
*/
async function getRules(appUserId: number): Promise<IRepeatRules[]> {
  const getRulesQuery = 'SELECT * FROM repeat_rule WHERE app_user_id = $1;';

  try {
    const allUserCredentials = await pgConfigured.manyOrNone(getRulesQuery, appUserId);
    return allUserCredentials;
  } catch (error) {
    throw new Error(error);
  }
}

/* Returns only task objects that have a tag starting with "repeated"
*/
function filterOutUnrepeatedTasks(tasks: ITask[]): ITaskWithRepeatTimeStamp[] {
  const tranformatedRepeatedTasks: ITaskWithRepeatTimeStamp[] = [];

  // eslint-disable-next-line consistent-return
  tasks.forEach((task: ITask) => {
    if (task.tags.length === 0) { return false; }

    const { tags } = task;
    const matcher: RegExp = /^repeated/;

    const repeatedTag: string | undefined = tags.find((tag: string) => matcher.test(tag));

    if (repeatedTag) {
      const dateMatcher = /^repeated:(\d{4}-\d{2}-\d{2}.*)/i;
      // @ts-ignore
      const datePartOnly = (repeatedTag.match(dateMatcher)[1]);

      const reshaped: ITaskWithRepeatTimeStamp = {
        ...task,
        alreadyRepeated: true,
        repeatTimeStamp: datePartOnly,
      };

      tranformatedRepeatedTasks.push(reshaped);
    }
  });

  return tranformatedRepeatedTasks;
}

/* fetch tasks for a single project gid. Verified by access token
  run a callback if given. Then return
*/
async function fetchTasks(projectGid: string, verifiedAccessToken: string, callback: Function,
  taskFields?: string[]): Promise<ITaskWithRepeatTimeStamp[]> {
  const finalTaskFields = (taskFields || ['name', 'gid', 'notes', 'tags', 'projects', 'due_on', 'this.projects.name']).join(',');

  const taskEndpoint = buildUrl(apiUrlBase, {
    path: '/tasks',
    queryParams: {
      project: projectGid,
      opt_fields: finalTaskFields,
    },
  });

  try {
    const response = await fetch(taskEndpoint, {
      mode: 'cors',
      headers: {
        'content-type': 'x-www-form-urlencoded',
        authorization: `Bearer ${verifiedAccessToken}`,
      },
    });

    const tasks: ITask[] = (await response.json()).data;

    const transformedTasks: ITaskWithRepeatTimeStamp[] = callback(tasks);
    return transformedTasks;
  } catch (error) {
    throw new Error(error);
  }
}

/* Gets all repeated tasks for a si
*/
async function getRepeatedTasks(userTasksRules: UserTasksRules,
  verifiedAccessToken: string): Promise<ITask[]> {
  // filter the task array
  // check each task for a repeated tag. filter on whether found or not
  const { unfilteredTasks } = userTasksRules;
  const filteredTasks = filterOutUnrepeatedTasks(unfilteredTasks);

  return filteredTasks;
}

/* converts tag data into repeat information at the task level
*/
function findAllCurrentRepeats(tasksAndRules: UserTasksRules[]) {

}

/* Detects which repeats should be there but are not
*/
// function findMissingTasks(repeatRules: IRepeatRules[], repeatedTasks: ITask[]): MissingTask[] {
// group tasks by original

// compile list of dates for each original

// compile list of all dates original task should have

// find missing repeat dates

// create task objects for missing repeats
// }

/* creates a missing task
*/
async function createMissing(missingTask: ITaskWithRepeatTimeStamp,
  verifiedAccessToken: string): Promise<boolean> {
  const {
    name, notes, projects, due_on, repeatTimeStamp,
  } = missingTask;

  const projectsTyped = String(projects);

  const createUrl = buildUrl(apiUrlBase, {
    path: '/task',
    queryParams: {
      name, notes, projectsTyped, due_on, tags: [`repeated:${repeatTimeStamp}`],
    },
  });

  try {
    const response = await fetch(createUrl, {
      method: 'post',
      mode: 'cors',
      headers: new Headers({
        'content-type': 'application/x-www-form-urlencoded',
        authorization: `Bearer ${verifiedAccessToken}`,
      }),
    });

    if (response.status === 201) { return true; }

    const { status, statusText } = response;
    console.log(`Response status: ${status} - ${statusText}`);
    return false;
  } catch (error) {
    throw new Error(error);
  }
}
