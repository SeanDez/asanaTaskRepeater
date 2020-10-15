import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Express from 'express';
import expressSession from 'express-session';
import { Client as PGClient, QueryResult } from 'pg';

import { App_User } from './shared/IApp_User';
import oAuthRouter from './authenticate/router';
import accountDataRouter from './accountData/router';
import repeatRules from './repeatRules/router';

require('dotenv').config();

const server = Express();

const expressSessionOptions = {
  secret: process.env.SESSION_SECRET!,
};

const corsConfigured = cors({
  credentials: true,
  origin: true,
});

server
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(corsConfigured)
  .use(cookieParser())
  .use(Express.json())
  .use('/oauth', oAuthRouter)
  .use('/account-data', accountDataRouter)
  .use('/repeat-rules', repeatRules);

server.listen(Number(process.env.SERVER_PORT), () => {
  /* eslint-disable no-console */
  console.log(`Express server listening on port ${process.env.SERVER_PORT}`);
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  console.log(`Server last restarted: ${date} at ${time}`);
});
