import Express from 'express';
import authCodeRouter from './oauth/router';

require('dotenv').config();

const server = Express();

server
  .use(Express.json())
  .use(authCodeRouter);

server.listen(Number(process.env.SERVER_PORT), () => {
  // eslint-disable-next-line no-console
  console.log(`Server last restarted on ${new Date()}`);
  console.log('Manual debug counter:', 1);
  console.log(`Express server listening on port ${process.env.SERVER_PORT}`);
});
