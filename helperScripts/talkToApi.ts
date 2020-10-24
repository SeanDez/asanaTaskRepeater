import 'es6-promise';
import 'isomorphic-fetch';
import buildUrl from 'build-url';
import { apiUrlBase } from '../src/shared/globals';
import TokenHandler from '../src/authTokenHandling/TokenHandler'
import envTyped from '../src/shared/envVariablesTyped';

const { ASANA_TEST_ACCOUNT_EMAIL } = envTyped;

const 

(async () => {
  const accessToken = 0;

  const requestUrl = buildUrl(apiUrlBase, {
    path: '',
  });

  try {
    const response = await fetch(requestUrl, {
      method: 'get',
      mode: 'cors',
      headers: new Headers({
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': `Bearer ${accessToken}`;
      }),
    });
  } catch (error) {
    throw new Error(error);
  }
})();
