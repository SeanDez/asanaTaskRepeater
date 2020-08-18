import Express from 'express';
import passport from 'passport';
import expressSession from 'express-session';
import { Client as PGClient, QueryResult } from 'pg';
import oAuthRouter from './oauth/router';
import { App_User } from './shared/IApp_User';

require('dotenv').config();

const server = Express();

// setup a session cookie
passport.serializeUser((userData: App_User, serialize: Function) => {
  serialize(null, userData.id);
});

const findUserByIdQuery = `SELECT *
FROM app_user
WHERE CAST(id AS varchar(40)) = CAST($1 AS varchar(40));
`;

// decrypt a session cookie
passport.deserializeUser(async (userId: number, deserialize: Function) => {
  try {
    const pgClient = new PGClient();
    pgClient.connect();
    const queryResult: QueryResult = await pgClient.query(findUserByIdQuery, [userId]);
    pgClient.end();

    if (queryResult.rows.length > 0) {
      const userRecord: App_User = queryResult.rows[0];
      return Promise.resolve(deserialize(null, userRecord));
    }

    // user not found
    return Promise.resolve(deserialize(null, false));
  } catch (error) {
    return Promise.resolve(deserialize(error));
  }
});

const expressSessionOptions = {
  secret: process.env.SESSION_SECRET!,
};

server
  .use(Express.json())
  .use(expressSession(expressSessionOptions))
  .use(passport.initialize())
  .use(passport.session())
  .use(oAuthRouter);

server.listen(Number(process.env.SERVER_PORT), () => {
  // eslint-disable-next-line no-console
  console.log(`Express server listening on port ${process.env.SERVER_PORT}`);
});
