/* eslint-disable no-unused-vars */
import dotenv from 'dotenv';
import { Router, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';

import passportWithAsanaStrategy from './asanaStrategy';
import { IEncryptedUserTableData } from './encryptedUserCreds';

dotenv.config();
const { FRONTEND_URL, JWT_SECRET } = process.env;

const router = Router();

/*
  Setup a request object with req.user populated
*/
interface User { user_id: string }
interface AuthenticatedRequest extends Request {
  user?: User
}

// -------------- All of these routes are nested under /oauth

/*
  This route is hit after the user logs in (or grants scopes initally)

  A JWT is set with the asana_id. Then a redirect to the front end app
*/
router.get(
  '/callback',
  passportWithAsanaStrategy.authenticate('Asana'),
  (req: Request, res: Response) => {
    // send back a jwt
    // jwt has the asana_id and is signed
    const jwt = jsonwebtoken.sign((req.user as { asana_id: string }).asana_id, JWT_SECRET!);

    res
      .cookie('asanaIdJwt', jwt)
      .status(200)
      .redirect(FRONTEND_URL!);
  },
);

/*
  Determines if there is a valid cookie / JWT

  If there, it is assumed valid
*/
router.get('/cookieCheck', (req: Request, res: Response) => {
  const { asanaIdJwt } = req.cookies;

  if (typeof asanaIdJwt === 'undefined') {
    res.status(401).send();
  }

  res.status(204).send();
});

/*
  Sends back user's account data after user has passed authentication

  account data includes settings and repeat_rules
*/
router.get('/accountData', (req: Request, res: Response) => {

});

router.get('/logout', (req: Request, res: Response) => {
  req.logout();
});

/*
  passport middleware redirects to the scope grant page

  thus no route handler callback
*/
router.get('/', passportWithAsanaStrategy.authenticate('Asana'));

export default router;
