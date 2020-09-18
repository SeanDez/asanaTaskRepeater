import EGrantTypes from './EGrantTypes';

export default interface IAuthCodeRequest {
  'grant_type': 'authorization_code' | 'refresh_token';
  'client_id': string;
  'client_secret': string;
  'redirect_uri': string;
  'code': string;
  'code_verifier'?: string;
}
