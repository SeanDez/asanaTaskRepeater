import cookieParser from 'cookie-parser';
import cors from 'cors';
import Express from 'express';
import expressSession from 'express-session';
import passport, { use } from 'passport';
import { Client as PGClient, QueryResult } from 'pg';

import { App_User } from './shared/IApp_User';
import oAuthRouter from './authenticate/router';

require('dotenv').config();

const server = Express();

// setup a session cookie
// passport.serializeUser((userData: App_User, serialize: Function) => {
//   serialize(null, userData.id);
// });

// const findUserByIdQuery = `SELECT *
// FROM app_user
// WHERE CAST(id AS varchar(40)) = CAST($1 AS varchar(40));
// `;

// decrypt a session cookie and access db data with its value
// passport.deserializeUser(async (userId: number, deserialize: Function) => {
//   try {
//     const pgClient = new PGClient();
//     pgClient.connect();
//     const queryResult: QueryResult = await pgClient.query(findUserByIdQuery, [userId]);
//     pgClient.end();

//     if (queryResult.rows.length > 0) {
//       const userRecord: App_User = queryResult.rows[0];
//       return deserialize(null, userRecord);
//     }

//     // user not found
//     return deserialize(null, false);
//   } catch (error) {
//     return deserialize(error);
//   }
// });

// const expressSessionOptions = {
//   secret: process.env.SESSION_SECRET!,
// };

const corsConfigured = cors({
  credentials: true,
});

server
  .use(corsConfigured)
  .use(cookieParser())
  .use(Express.json())
  // .use(expressSession(expressSessionOptions))
  .use(passport.initialize())
  .use(passport.session())
  .use('/oauth', oAuthRouter);

server.listen(Number(process.env.SERVER_PORT), () => {
  /* eslint-disable no-console */
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  console.log(`Server last restarted: ${date} at ${time}`);
  console.log(`Express server listening on port ${process.env.SERVER_PORT}`);
});
