import IAppUser from '../IApp_User';

type SharedFields = Omit<
  IAppUser,
  'refresh_token_encrypted' | 'access_token_encrypted'
>

export default interface IApp_UserDecrypted extends SharedFields {
  refresh_token_decrypted: string;
  access_token_decrypted: string;
}
