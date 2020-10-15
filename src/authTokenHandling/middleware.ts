import Encryptor from 'simple-encryptor';
import { Request, Response, NextFunction } from 'express';

import TokenHandler from './TokenHandler';
import envTyped from '../shared/envVariablesTyped';
import { RequestWithToken } from './IRequestWithToken';

const { ENCRYPTOR_SECRET } = envTyped;

const encryptor = Encryptor.createEncryptor(ENCRYPTOR_SECRET);

// check if the current access token is good. if not get a new token
// attach the token to req.verifiedAccessToken
export default async (req: Request, res: Response, next: NextFunction) => {
  const asana_email_encrypted = req.get('asana_email_encrypted') as string;
  const asanaEmailDecrypted: string = encryptor.decrypt(asana_email_encrypted) as string;

  try {
    const tokenHandler = new TokenHandler(asanaEmailDecrypted, res);
    const accessToken: string = await tokenHandler.getValidAuthToken();
    req.verifiedAccessToken = accessToken;
    next();
  } catch (error) {
    res.status(500).send(error);
  }
};
