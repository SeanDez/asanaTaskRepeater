import buildUrl from 'build-url';
import moment from 'moment';
import qs from 'qs';
import ITask from '../shared/interfaces/ITask';
import { apiUrlBase } from '../shared/globals';

export async function createTask(task: ITask, verifiedAccessToken: string) {
  const {
    gid, name, notes, projects, due_at, due_on,
  } = task;

  let dueTime: string = '';
  if (typeof due_at === 'string') {
    dueTime = moment(due_at).format('[T]HH:MM:00Z');
  }

  const projectsTyped = String(projects);

  const formEncodedBody = qs.stringify({
    data: {
      name, notes, projectsTyped, due_on, tags: [`repeated:${due_on}${dueTime}`, `originalTaskGid:${gid}`],
    },
  });

  const createUrl = buildUrl(apiUrlBase, {
    path: '/tasks',
    queryParams: {
      data: formEncodedBody,
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

    const { status, statusText, json } = response;
    if (status === 201) {
      const { data } = (await json());
      console.log(`======= New Repeated Task Created =======\n${data}`);

      return true;
    }

    console.log(`Response status: ${status} - ${statusText}`);
    return false;
  } catch (error) {
    throw new Error(error);
  }
}
