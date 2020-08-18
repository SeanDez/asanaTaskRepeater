/* eslint-disable no-unused-vars */
import { Router, Request, Response } from 'express';
import passportWithAsanaStrategy from './asanaStrategy';

const router = Router();

router.get(
  '/oauth',
  passportWithAsanaStrategy.authenticate('Asana'),
  (req: Request, res: Response) => { /* IGNORED */ },
);

router.get(
  '/oauth/callback',
  passportWithAsanaStrategy.authenticate('Asana', { failureRedirect: '/login' },
    (req: Request, res: Response) => {
    // Successful authentication, redirect home.
      res.redirect('/');
      // todo WORK ON THIS ROUTE
      // figure out what should be done next
      // get the refresh token. Initial access token
      // print the token to screen and console
      // after that, either pause the project, or continue it.
      // pause and voip.ms is probably preferred
      // endpoint for token exchange is https://app.asana.com/-/oauth_token
    }),
);

export default router;
