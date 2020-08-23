import PGPromise from 'pg-promise';
import Encryptor from 'simple-encryptor';
import dotenv from 'dotenv';
import dbConfig from './dbConfig';
import IApp_User from './IApp_User';

dotenv.config();

const encryptor = Encryptor.createEncryptor(process.env.ENCRYPTOR_SECRET!);

const pgpInitialized = PGPromise({ capSQL: true });
const pgpConnection = pgpInitialized(dbConfig);

/* eslint-disable class-methods-use-this */
export default class AsanaUser {
  constructor(private asana_id: string) {
    this.asana_id = asana_id;
  }

  public async findByAsanaId(): Promise<IApp_User | null> {
    const findUserByAsanaId = 'SELECT * from app_user WHERE asana_id = CAST($1 as text)';

    // await inferred by return keyword
    return this.returnAsanaUserOrNull(findUserByAsanaId, this.asana_id);
  }

  public async createNew(name: string, email: string, refresh_token_raw: string,
    access_token_raw: string): Promise<IApp_User | null> {
    const createNewUserQuery = `INSERT INTO app_user (asana_id, name, email, refresh_token_encrypted, access_token_encrypted)
    VALUES (CAST($1 as text), $2, $3, $4, $5) RETURNING *;`;

    const refresh_token_encrypted = encryptor.encrypt(refresh_token_raw);
    const access_token_encrypted = encryptor.encrypt(access_token_raw);

    // await inferred by return keyword
    const dbResponse = await this.returnAsanaUserOrNull(createNewUserQuery,
      [this.asana_id, name, email, refresh_token_encrypted, access_token_encrypted]);

    return dbResponse;
  }

  public async update(columnsAndValues: object): Promise<IApp_User> {
    const insertFragment = pgpInitialized.helpers.insert(columnsAndValues, null, { table: 'app_user' });
    const fullUpdateQuery = `${insertFragment} 
    WHERE asana_id = ${this.asana_id}
    RETURNING *;`;
    const updatedUserData = await pgpConnection.one(fullUpdateQuery);
    return updatedUserData;
  }

  // --------------- Internal Methods

  private async returnAsanaUserOrNull(queryString: string, sqlParams: string | any[]) {
    try {
      const allColumns: IApp_User | null = await
      pgpConnection.oneOrNone(queryString, sqlParams);
      return allColumns;
    } catch (error) {
      throw new Error(error);
    }
  }
}
