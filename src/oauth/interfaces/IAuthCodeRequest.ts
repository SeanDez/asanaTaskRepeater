import EGrantTypes from './EGrantTypes';

export default interface IAuthCodeRequest {
  'grant_type': EGrantTypes;
  'client_id': string;
  'client_secret': string;
  'redirect_uri': string;
  'code': string;
  'code_verifier'?: string;
}
