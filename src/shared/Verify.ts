import dotenv from 'dotenv';
import 'es6-promise';
import 'isomorphic-fetch';
import qs from 'qs';
import Encryptor from 'simple-encryptor';

import { pgConfigured } from '../shared/database';
import EGrantTypes from '../shared/EGrantTypes';

dotenv.config();
const {
  ENCRYPTOR_SECRET, ASANA_CLIENT_ID, ASANA_CLIENT_SECRET, ASANA_HTTPS_REDIRECT_URL,
} = process.env;

const encryptor = Encryptor.createEncryptor(ENCRYPTOR_SECRET!);

enum tokenTypes {
  access = 'access_token_encrypted',
  refresh = 'refresh_token_encrypted'
}

/*
  Does a test request to see if a valid response returns
*/
async function accessTokenIsValid(suspectToken: string): Promise<boolean> {
  const testEndpoint = 'https://app.asana.com/api/1.0/users/me';

  const testRequestOptions = {
    method: 'get',
    mode: 'cors' as 'cors',
    headers: {
      authorization: `Bearer ${suspectToken}`,
    },
  };

  try {
    const response = await fetch(testEndpoint, testRequestOptions);
    const jsonData = response.json();

    if ('gid' in Object(jsonData)) {
      return true;
    }

    return false;
  } catch (error) {
    throw new Error(error);
  }
}

export default class Verify {
  constructor(private asana_email: string) {
    this.asana_email = asana_email;
  }

  /*
    returns true if database state value matches front end (argument) state value.
    Else returns false
  */
  public async stateMatches(frontEndState: string): Promise<boolean> {
    const selectStateQuery = 'SELECT state from app_user WHERE asana_email = $1';

    try {
      const storedState = await pgConfigured.oneOrNone(selectStateQuery, this.asana_email);

      return storedState === frontEndState;
    } catch (error) {
      throw new Error(error);
    }
  }

  public async getValidAuthToken(): Promise<string> {
    const currentAccessToken: string = await this.getStoredToken();
    const storedTokenIsValid: boolean = await accessTokenIsValid(currentAccessToken);

    if (storedTokenIsValid === false) {
      const newToken = await this.getNewAccessToken();
      await this.storeAccessToken(newToken);
      return newToken;
    }

    return currentAccessToken;
  }

  /*
    Uses the stored refresh token to get a new access token
  */
  private async getNewAccessToken(redirectUrl: string): Promise<string> {
    try {
      // get stored refresh token
      const refresh_token_decrypted = await this.getStoredToken(tokenTypes.refresh);

      const tokenExchangeEndpoint = 'https://app.asana.com/-/oauth_token';

      const tokenFetchOptions = {
        method: 'post',
        mode: 'cors' as 'cors',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          accept: 'application/json',
        },
        body: qs.stringify({
          client_id: ASANA_CLIENT_ID,
          client_secret: ASANA_CLIENT_SECRET,
          redirect_uri: redirectUrl,
          grant_type: EGrantTypes.refreshToken,
          refresh_token: refresh_token_decrypted,
        }),
      };

      const response = await fetch(tokenExchangeEndpoint);
      const tokenData = await response.json();

      const { access_token } = tokenData;
      const access_token_encrypted = encryptor.encrypt(access_token);
      const { gid, name: display_name } = tokenData.data;

      // overwrite the current user record with updated info
      const insertUserQuery = 'UPDATE TABLE app_user SET gid = $1, asana_email, display_name = $2, access_token_encrypted = $3 WHERE asana_email = $4;';

      await pgConfigured.one(insertUserQuery,
        [gid, display_name, access_token_encrypted, this.asana_email]);
      return access_token;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async getStoredToken(tokenType: tokenTypes): Promise<string> {
    const getTokenQuery = `SELECT ${tokenType} FROM app_user WHERE asana_email = $1`;

    try {
      const encryptedToken = await pgConfigured.one(getTokenQuery, this.asana_email);

      const decryptedToken = encryptor.decrypt(encryptedToken);
      return decryptedToken;
    } catch (error) {
      throw new Error(error);
    }
  }
}
