import { Request, Response, NextFunction } from 'express';
import Encryptor from 'simple-encryptor';
import envTyped from '../shared/envVariablesTyped';

const { ENCRYPTOR_SECRET } = envTyped;

const encryptor = Encryptor.createEncryptor(ENCRYPTOR_SECRET);

export function addEmailFromCookie(req: Request, res: Response, next: NextFunction) {
  const { asana_email_encrypted } = req.cookies;

  if (typeof asana_email_encrypted === 'undefined') {
    res.json({ error: 'addEmailFromCookie - asana_email_encrypted was undefined' });
  }

  const asana_email_decrypted = encryptor.decrypt(asana_email_encrypted);

  req.asana_email_decrypted = asana_email_decrypted;
  next();
}
