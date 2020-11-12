import 'es6-promise';
import 'isomorphic-fetch';

import User from './User';
import { pgConfigured } from '../shared/database';
import TokenHandler from '../authTokenHandling/TokenHandler';
import { IUserCredentials } from './IUserCredentials';
import { createTask } from './createTask';

export default class ProcessController {
  private users: User[] = [];

  public async asyncInit() {
    await this.loadUsers();
  }

  /*
    get all users
    for each one, have them get their rules
      if the rule applies today, pull the task info and copy the task
  */
  public async copyQualifiedTasksForAll(): Promise<void> {
    try {
      for await (const user of this.users) {
        const tokenHandler = new TokenHandler(user.asanaEmail);
        const accessToken = await tokenHandler.getValidAuthToken();

        await user.asyncInit(); // loads all repeat rules

        for await (const rule of user.rules) {
          const appliesToday = rule.appliesToday();

          if (appliesToday) {
            console.log(`-----------------\nA task for user localId ${user.localId} on task ${rule.taskGid} is in the process of lookup and duplication.\n\n`);

            const taskData = await rule.lookupOriginal(accessToken);
            const newTask = await createTask(taskData, accessToken);
          } else {
            console.log(`-----------------\nToday does not match a copy command for user localId ${user.localId} on task gid ${rule.taskGid}\n\n`);
          }
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  // -------------------- Internal methods

  /* Gets the user credentials for every user in the database
  */
  private async loadUsers(): Promise<void> {
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
}
