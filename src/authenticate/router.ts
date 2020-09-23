/* eslint-disable no-unused-vars */
import dotenv from 'dotenv';
import 'es6-promise';
import 'isomorphic-fetch';
import { Router, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';

import passportWithAsanaStrategy from './asanaStrategy';
import EGrantTypes from './EGrantTypes';
import { IEncryptedUserTableData } from './encryptedUserCreds';

dotenv.config();
const {
  FRONTEND_URL, JWT_SECRET, ASANA_CLIENT_ID, ASANA_CLIENT_SECRET, ASANA_HTTPS_REDIRECT_URL,
} = process.env;

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
  Also finds or creates a new user locally
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
      redirect_uri: ASANA_HTTPS_REDIRECT_URL,
      response_type: EGrantTypes.authCode,
      state: req.query.state,
    }),
  };

  try {
    const tokenEndpointResponse = await fetch(tokenExchangeEndpoint, requestOptions);

    const tokenData = await tokenEndpointResponse.json();

    const pausePoint = tokenData;

    // save to db
  } catch (error) {
    throw new Error(error);
  }
});

export default router;
