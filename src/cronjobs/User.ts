import RepeatRule from './RepeatRule';
import { pgConfigured } from '../shared/database';

export default class User {
  public rules: RepeatRule[] = [];

  constructor(
    public localId: number,
    public asanaEmail: string,
    public asanaGid: string,
    public refreshTokenEncrypted: string,
    public accessTokenEncrypted: string,
  ) {}

  public async asyncInit() {
    const rules = await this.loadRules();
  }

  // ------------------ Internal methods

  private async loadRules() {
    const getRulesQuery = 'SELECT * FROM repeat_rule WHERE app_user_id = $1;';

    try {
      const allUserCredentials = await pgConfigured.manyOrNone(getRulesQuery, this.localId);
      return allUserCredentials;
    } catch (error) {
      throw new Error(error);
    }
  }
}
