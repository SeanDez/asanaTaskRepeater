import 'es6-promise';
import 'isomorphic-fetch';
import { Router, Request, Response } from 'express';
import { pgpConfigured } from '../../shared/dbConfig';

const router = Router();

router.get('/getValidAccessToken', async (req: Request, res: Response) => {
  const { asana_id } = req.body;

  try {
    const selectTokenByUser = 'SELECT access_token_encrypted FROM app_user WHERE CAST(asana_id AS TEXT) = CAST($1 AS TEXT)';
    const authToken: string = await pgpConfigured.one(selectTokenByUser, asana_id);

    // test if the tokened request responds with a user or error
    const userUrl = 'https://app.asana.com/api/1.0/users/me';
    const userTestResponse = await fetch(userUrl, {
      method: 'get',
      mode: 'cors',
      headers: {
        'content/type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
    });

    const userOrError = userTestResponse.json();

    if ('errors' in userOrError) {
      // try updating the access token with the refresh token
    }

  } catch (error) {
    res.json({ errorName: error.name, message: error.message });
  }
});

/*
  Uses the refresh token to get a new access token

  Saves the new access token to the database

  Mainly for internal use by other backend routes
*/
router.get('/newToken', async (req: Request, res: Response) => {
  const { asana_id } = req.query;

  const refreshTokenQuery = 'SELECT refresh_token_encrypted from app_user WHERE CAST(asana_id AS TEXT) = CAST($1 AS TEXT)';

  try {
    const refreshToken: string = await pgpConfigured.one(refreshTokenQuery, asana_id);

    const tokenEndpoint = 'https://app.asana.com/-/oauth_token';
    const tokenEndpointResponse = await fetch(tokenEndpoint, {
      
    });
  } catch (error) {
    throw new Error(error);
  }
});

export default router;
