import buildUrl from 'build-url';
import 'es6-promise';
import 'isomorphic-fetch';
import moment from 'moment';
import qs from 'qs';

import User from './User';
import RepeatRule from './RepeatRule';
import Task from './Task';
import envTyped from '../shared/envVariablesTyped';
import { pgConfigured } from '../shared/database';
import IRepeatRule from '../shared/interfaces/IRepeatRule';
import TokenHandler from '../authTokenHandling/TokenHandler';
import { IUserCredentials } from './IUserCredentials';
import ITask from '../shared/interfaces/ITask';
import { apiUrlBase } from '../shared/globals';

export default class ProcessController {
  private users: User[] = [];

  public async asyncInit() {
    await this.loadUsers();
  }

  /*
    get all users
    for each one, have them get their rules
      if the rule applies today, pull the task info and do a copy operation
  */
  public async copyQualifiedTasksForAll(): Promise<void> {
    try {
      const unresolvedTasks = this.users.map(async (user: User) => {
        const tokenHandler = new TokenHandler(user.asanaEmail);
        const accessToken = await tokenHandler.getValidAuthToken();
        await user.asyncInit(); // loads all repeat rules

        const ruleResults = user.rules.map(async (rule: RepeatRule) => {
          const appliesToday = rule.appliesToday();

          if (appliesToday) {
            console.log(`-----------------\nA task for user localId ${user.localId} on task ${rule.taskGid} is in the process of lookup and duplication.\n\n`);

            // lookup the task info (up to date -- single source of truth)
            // create new task
            const taskData = await rule.lookupOriginal(accessToken);
            const newTask = await this.createTask(taskData, accessToken);
          } else {
            console.log(`-----------------\nToday does not match a copy command for user ${user.localId} on task gid ${rule.taskGid}\n\n`);
          }
        });

        await Promise.all(ruleResults);
      });

      await Promise.all(unresolvedTasks);
    } catch (error) {
      throw new Error(error);
    }
  }

  // -------------------- Internal methods

  /* Gets the user credentials for every user in the database
  */
  async loadUsers(): Promise<void> {
    const getAllUsersQuery = 'SELECT local_id, gid, asana_email,refresh_token_encrypted, access_token_encrypted FROM app_user;';

    try {
      const allUserCredentials = await pgConfigured.manyOrNone(getAllUsersQuery);

      const shapedUsers = allUserCredentials.map(({
        local_id, asana_email, gid, refresh_token_encrypted, access_token_encrypted,
      }: IUserCredentials) => (
        new User(local_id, asana_email, gid, refresh_token_encrypted, access_token_encrypted)
      ));

      this.users = allUserCredentials;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async createTask(task: ITask, verifiedAccessToken: string) {
    const {
      gid, name, notes, projects, due_at, due_on,
    } = task;

    let dueTime: string = '';
    if (typeof due_at === 'string') {
      dueTime = moment(due_at).format('[T]HH:MM:00Z');
    }

    const x = this.users;

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
}
