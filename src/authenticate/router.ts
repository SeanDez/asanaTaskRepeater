/* eslint-disable no-unused-vars */
import dotenv from 'dotenv';
import Encryptor from 'simple-encryptor';
import 'es6-promise';
import 'isomorphic-fetch';
import { Router, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';

import passportWithAsanaStrategy from './asanaStrategy';
import { pgOptioned, pgConfigured } from '../shared/database';
import EGrantTypes from './EGrantTypes';
import { IEncryptedUserTableData } from './encryptedUserCreds';

dotenv.config();
const {
  FRONTEND_URL, JWT_SECRET, ASANA_CLIENT_ID, ASANA_CLIENT_SECRET, ASANA_HTTPS_REDIRECT_URL,
  ENCRYPTOR_SECRET,
} = process.env;

const encryptor = Encryptor.createEncryptor(ENCRYPTOR_SECRET!);

const router = Router();

/*
  Setup a request object with req.user populated
*/
interface User { user_id: string }
interface AuthenticatedRequest extends Request {
  user?: User
}

const tokenExchangeEndpoint = 'https://app.asana.com/-/oauth_token';

// -------------- All of these routes are nested under /oauth

/*
  Receives the auth code. Handles initial token exchange
  Also finds or creates a new user locally, and responds with a jwt cookie
*/
router.get('/receives-auth-code', async (req: Request, res: Response) => {
  const requestOptions = {
    method: 'post',
    mode: 'cors' as 'cors',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: ASANA_CLIENT_ID,
      client_secret: ASANA_CLIENT_SECRET,
      redirect_uri: ASANA_HTTPS_REDIRECT_URL,
      response_type: EGrantTypes.authCode,
      state: req.query.state,
    }),
  };

  try {
    const tokenEndpointResponse = await fetch(tokenExchangeEndpoint, requestOptions);

    const tokenData = await tokenEndpointResponse.json();

    // todo patch this with actual property access after a test request
    const {
      email: asana_email, gid, name: display_name, refresh_token, access_token,
    } = tokenData._json;

    // see if current user exists
    const checkUserQuery = 'SELECT * FROM app_user WHERE CAST(asana_email AS TEXT) = CAST($1 AS TEXT);';
    const userResult = await pgConfigured.oneOrNone(checkUserQuery, asana_email);

    // if no user, insert new user
    if (checkUserQuery === null) {
      const insertUserQuery = 'INSERT INTO app_user (gid, asana_email, display_name, refresh_token_encrypted, access_token_encrypted) VALUES ($1, $2, $3, $4, $5) RETURNING asana_email;';
      const refresh_token_encrypted = encryptor.encrypt(refresh_token);
      const access_token_encrypted = encryptor.encrypt(access_token);

      const insertedUserAsanaEmail = await pgConfigured.one(insertUserQuery,
        [gid, asana_email, display_name, refresh_token_encrypted, access_token_encrypted]);

      // setup a jwt
      // put it in a cookie and respond
      const jwtWithAsanaEmail = jsonwebtoken.sign(insertedUserAsanaEmail, JWT_SECRET!);

      res
        .status(204)
        .cookie('asana_email', jwtWithAsanaEmail, { httpOnly: true })
        .redirect(FRONTEND_URL!);
    }
  } catch (error) {
    throw new Error(error);
  }
});

/*
  Sends 204 code if user found. Otherwise sends 401
*/
router.get('/session-check', (req: Request, res: Response) => {
  if ('asana_email' in req.cookies) {
    res.status(204).send();
  }

  res.status(401).send();
});

export default router;
