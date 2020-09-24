import 'es6-promise';
import 'isomorphic-fetch';

export default class Verify {
  constructor(private asana_email: string) {
    this.asana_email = asana_email;
  }

  validateOrUpdateAuthToken() {
    const validAuthToken = await this.authTokenIsValid();

    if (validAuthToken === false) {
      this.requestNewAuthToken();
    }
  }

  /*
    Does a test request to see if a valid response returns
  */
  authTokenIsValid() {
    // do a test request
    // if valid return true
    // else return false
  }

  requestNewAuthToken() {

  }
}