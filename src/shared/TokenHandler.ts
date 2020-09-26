import dotenv from 'dotenv';
import 'es6-promise';
import 'isomorphic-fetch';
import qs from 'qs';
import Encryptor from 'simple-encryptor';

import { pgConfigured } from './database';
import EGrantTypes from './EGrantTypes';

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
      'content-type': 'application/json',
      accept: 'application/json',
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

export default class TokenHandler {
  constructor(private asana_email: string) {
    this.asana_email = asana_email;
  }

  public async getValidAuthToken(): Promise<string> {
    const currentAccessToken: string = await this.getStoredToken(tokenTypes.access);
    const storedTokenIsValid: boolean = await accessTokenIsValid(currentAccessToken);

    if (storedTokenIsValid === false) {
      const newToken = await this.getNewAccessToken();
      await this.storeToken(tokenTypes.access, newToken);
      return newToken;
    }

    return currentAccessToken;
  }

  /*
    Uses the stored refresh token to get a new access token
  */
  private async getNewAccessToken(): Promise<string> {
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
          redirect_uri: ASANA_HTTPS_REDIRECT_URL,
          grant_type: EGrantTypes.refreshToken,
          refresh_token: refresh_token_decrypted,
        }),
      };

      const response = await fetch(tokenExchangeEndpoint);
      const tokenData = await response.json();

      const { access_token } = tokenData;
      return access_token;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async storeToken(tokenType: tokenTypes, tokenValue: string) {
    const encryptedToken = encryptor.encrypt(tokenValue);
    // overwrite the current user record with updated info
    const insertUserQuery = `UPDATE app_user SET ${tokenType} = $1 WHERE asana_email = $2;`;

    await pgConfigured.none(insertUserQuery,
      [encryptedToken, this.asana_email]);
    return encryptedToken;
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
