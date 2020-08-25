import { Router, Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import 'es6-promise';
import 'isomorphic-fetch';
import dotenv from 'dotenv';
import Encryptor from 'simple-encryptor';
import AsanaUser from '../shared/AsanaUser';

import EGrantTypes from './interfaces/EGrantTypes';
import IAuthCodeRequest from './interfaces/IAuthCodeRequest';
import ITokenResponseBody from './interfaces/ITokenResponseBody';
import IApp_User from '../shared/IApp_User';
import IApp_UserDecrypted from '../shared/IApp_UserDecrypted';

dotenv.config();

const router = Router();
const encryptor = Encryptor.createEncryptor(process.env.ENCRYPTOR_SECRET!);

// pass code to asana. get back refresh and auth token, and user object
router.get('/authCode', async (req: Request, res: Response) => {
  const tokenExchangeEndpoint = 'https://app.asana.com/-/oauth_token';

  const tokenRequestBody: IAuthCodeRequest = {
    grant_type: EGrantTypes.authCode,
    client_id: process.env.ASANA_CLIENT_ID!,
    client_secret: process.env.ASANA_CLIENT_SECRET!,
    redirect_uri: process.env.ASANA_HTTPS_REDIRECT_URL!,
    code: req.query.code as string,
  };

  console.log('----------------------');
  console.log('tokenRequestBody', tokenRequestBody);
  console.log('----------------------');

  try {
    const response = await fetch(tokenExchangeEndpoint, {
      method: 'post',
      mode: 'cors',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(tokenRequestBody),
    });

    const tokenObject: ITokenResponseBody = await response.json();
    const { access_token, refresh_token } = tokenObject;
    const { id, name, email } = tokenObject.data;

    console.log('----------------------');
    console.log('tokenObject', tokenObject);
    console.log('----------------------');

    // see if the user already exists
    const asanaUserId: string = id;

    // todo what user info should be accessed?
    const asanaUser = new AsanaUser(id);
    let fullUserData: IApp_User | null = await asanaUser.findByAsanaId();

    if (fullUserData === null) {
      fullUserData = await asanaUser.createNew(name, email, refresh_token, access_token);
    } {
      // save/update the access/refresh token info
      const refresh_token_encrypted = encryptor.encrypt(refresh_token);
      const access_token_encrypted = encryptor.encrypt(access_token);

      fullUserData = await asanaUser
        .update({
          name, email, refresh_token_encrypted, access_token_encrypted,
        });
    }

    // attach a jwt to a cookie
    const jwt = jsonwebtoken.sign(id, process.env.JWT_SECRET!);

    res.cookie('asana_id_jwt', jsonwebtoken);

    // return the user's full dataset

    // get all projects
    const projectsEndpoint = '';
    const decryptedAccessToken = '';

    const projectsRawResponse = await fetch(projectsEndpoint, {
      method: 'get',
      mode: 'cors',
      headers: {
        accept: 'application/json',
        authorication: `Bearer ${decryptedAccessToken}`,
      },
    });

    const projectData = (await projectsRawResponse.json()).data;

    // todo create a task getter
    // todo create a rule getter
    const allTasks = null;
    const allRules = null;
    const allTasksAndRules = { allTasks, allRules };

    res
      .status(200)
      .json(projectData);
  } catch (error) {
    throw new Error(error);
  }
});

export default router;
