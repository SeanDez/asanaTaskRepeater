import User from './User';
import RepeatRule from './RepeatRule';
import Task from './Task';
import envTyped from '../shared/envVariablesTyped';
import { pgConfigured } from '../shared/database';
import IRepeatRule from '../shared/interfaces/IRepeatRule';
import TokenHandler from '../authTokenHandling/TokenHandler';
import { IUserCredentials } from './IUserCredentials';

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

        user.rules.forEach((rule: RepeatRule) => {
          const appliesToday = rule.appliesToday();

          if (appliesToday) {
            // lookup the task info (up to date -- single source of truth)
            // create new task
            const taskData = await rule.lookupOriginal();
            const newTask = await this.createTask();
          }
        });
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

  private taskIsOriginal() {}

  private taskMatchesRule() {}
}
