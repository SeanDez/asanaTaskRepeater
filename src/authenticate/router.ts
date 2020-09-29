/* eslint-disable no-unused-vars */
import dotenv from 'dotenv';
import 'es6-promise';
import { Router, Request, Response } from 'express';
import 'isomorphic-fetch';
import jsonwebtoken from 'jsonwebtoken';
import qs from 'qs';
import Encryptor from 'simple-encryptor';
import buildUrl from 'build-url';

import passportWithAsanaStrategy from './asanaStrategy';
import { pgOptioned, pgConfigured } from '../shared/database';
import EGrantTypes from '../shared/EGrantTypes';
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
  const { state } = req.query;

  const requestOptions = {
    method: 'post',
    mode: 'cors' as 'cors',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    },
    body: qs.stringify({
      client_id: ASANA_CLIENT_ID,
      client_secret: ASANA_CLIENT_SECRET,
      redirect_uri: ASANA_HTTPS_REDIRECT_URL,
      grant_type: EGrantTypes.authCode,
      code: req.query.code,
      state: req.query.state,
    }),
  };

  try {
    const tokenEndpointResponse = await fetch(tokenExchangeEndpoint, requestOptions);

    const tokenData = await tokenEndpointResponse.json();

    const { refresh_token, access_token } = tokenData;
    const { email: asanaEmailFromApi, gid, name: display_name } = tokenData.data;

    // see if current user exists
    const checkUserQuery = 'SELECT asana_email FROM app_user WHERE asana_email = $1;';
    let asanaEmailFromDb = await pgConfigured.oneOrNone(checkUserQuery, asanaEmailFromApi);

    // if no user, insert new user
    if (asanaEmailFromDb === null) {
      const insertUserQuery = 'INSERT INTO app_user (gid, asana_email, display_name, refresh_token_encrypted, access_token_encrypted, state) VALUES ($1, $2, $3, $4, $5, $6) RETURNING asana_email;';
      const refresh_token_encrypted = encryptor.encrypt(refresh_token);
      const access_token_encrypted = encryptor.encrypt(access_token);

      asanaEmailFromDb = await pgConfigured.one(insertUserQuery,
        [gid, asanaEmailFromApi, display_name,
          refresh_token_encrypted, access_token_encrypted, state]);
    }

    // setup a jwt
    // put it in a cookie, encrypt, and respond
    const jwtWithAsanaEmail = jsonwebtoken.sign(asanaEmailFromDb, JWT_SECRET!);
    const encryptedJwt = encryptor.encrypt(jwtWithAsanaEmail);

    const reactUrlWithEncryptedJwt = buildUrl(FRONTEND_URL!, {
      queryParams: {
        asana_email_encrypted: encryptedJwt,
      },
    });

    res.redirect(reactUrlWithEncryptedJwt);
  } catch (error) {
    throw new Error(error);
  }
});

router.get('/log-out', (req: Request, res: Response) => {
  if ('asana_email' in req.cookies) {
    res.clearCookie('asana_email');
  }

  if ('asana_state' in req.cookies) {
    res.clearCookie('asana_state');
  }

  res.status(204).send();
});

export default router;
