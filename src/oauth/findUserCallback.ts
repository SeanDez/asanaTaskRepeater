// eslint-disable-next-line no-unused-vars
import { Client as PGClient, QueryResult } from 'pg';

const findUserQuery = `SELECT id, user_name
FROM app_user
WHERE asana_id = CAST($1 as varchar(40));
`;

const createUserQuery = `INSERT INTO app_user ('asana_id') VALUES ('$1')
RETURNING *;
`;

interface UserRecord {
  id: number,
  asana_id: string
}

async function findAndPassUserToSerializer(asana_id: string, doneCallback: Function) {
  try {
    const pgClient = new PGClient();
    await pgClient.connect();
    const queryResult: QueryResult = await pgClient.query(findUserQuery, [asana_id]);

    if (queryResult.rows.length > 0) {
      const userRecord = queryResult.rows[0];
      pgClient.end();
      return doneCallback(null, userRecord);
    }

    // create new user
    const createQueryResult: QueryResult = await pgClient.query(createUserQuery, [asana_id]);
    pgClient.end();
    const newUserRecord: UserRecord = createQueryResult.rows[0];
    return Promise.resolve(doneCallback(null, newUserRecord));
  } catch (error) {
    return Promise.resolve(doneCallback(error, null));
  }
}

export default findAndPassUserToSerializer;
