import { Request } from 'express';

export interface IRequestWithAsanaEmailDecrypted extends Request {
  asana_email_decrypted: string;
}
