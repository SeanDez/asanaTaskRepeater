export default interface ITokenResponseBody {
  'access_token': string,
  'expires_in': number,
  'token_type': 'bearer',
  'refresh_token': string,
  'data': {
    'id': string,
    'name': string,
    'email': string,
  }
};
