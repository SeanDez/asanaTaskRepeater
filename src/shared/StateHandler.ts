import { pgConfigured } from './database';

export default class StateHandler {
  constructor(private asana_email: string) {
    this.asana_email = asana_email;
  }

  /*
    returns true if database state value matches front end (argument) state value.
    Else returns false
  */
  public async frontEndMatchesStored(frontEndState: string): Promise<boolean> {
    const selectStateQuery = 'SELECT state from app_user WHERE asana_email = $1';

    try {
      const storedState = await pgConfigured.oneOrNone(selectStateQuery, this.asana_email);

      return storedState === frontEndState;
    } catch (error) {
      throw new Error(error);
    }
  }
}
