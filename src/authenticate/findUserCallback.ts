// eslint-disable-next-line no-unused-vars
import { Client as PGClient, QueryResult } from 'pg';
import { IEncryptedUserTableData } from './encryptedUserCreds';

const findUserQuery = `SELECT id, asana_id
FROM app_user
WHERE CAST(asana_id as TEXT) = CAST($1 as TEXT;
`;

const createUserQuery = `INSERT INTO app_user (asana_id, refresh_token_encrypted, access_token_encrypted) VALUES ($1, $2, $3)
RETURNING *;
`;

interface UserRecord {
  id: number,
  asana_id: string
}

async function findAndPassUserToSerializer(
  userTableData: IEncryptedUserTableData, doneCallback: Function,
) {
  const { asana_id, refresh_token_encrypted, access_token_encrypted } = userTableData;

  try {
    const pgClient = new PGClient();
    await pgClient.connect();
    const queryResult: QueryResult = await pgClient.query(findUserQuery, [asana_id]);

    if (queryResult.rows.length > 0) {
      const userRecord = queryResult.rows[0];
      pgClient.end();

      // deserialize
      return doneCallback(null, userRecord);
    }

    // create new user
    const createQueryResult: QueryResult = await pgClient.query(createUserQuery,
      [asana_id, refresh_token_encrypted, access_token_encrypted]);
    pgClient.end();
    const newUserRecord: UserRecord = createQueryResult.rows[0];

    // deserialize
    return doneCallback(null, newUserRecord);
  } catch (error) {
    return doneCallback(error, null);
  }
}

export default findAndPassUserToSerializer;
