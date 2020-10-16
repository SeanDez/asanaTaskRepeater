import { Request, Response, NextFunction } from 'express';
import Encryptor from 'simple-encryptor';
import envTyped from '../shared/envVariablesTyped';
import { pgConfigured } from '../shared/database';
import { tryToRespondWithError } from '../errorHandling/respond';

const { ENCRYPTOR_SECRET } = envTyped;

const encryptor = Encryptor.createEncryptor(ENCRYPTOR_SECRET);

export async function attachAsanaEmail(req: Request, res: Response, next: NextFunction) {
  const asana_email_encrypted = req.get('asana_email_encrypted');

  if (typeof asana_email_encrypted === 'undefined') {
    const errorMessage = 'attachAppUserId - asana_email_encrypted was undefined';
    res.json({ error: errorMessage });
    throw new Error(errorMessage);
  }

  const asana_email_decrypted = encryptor.decrypt(asana_email_encrypted);
  req.asana_email_decrypted = asana_email_decrypted;
}

export async function attachAppUserId(req: Request, res: Response, next: NextFunction) {
  const asana_email_encrypted = req.get('asana_email_encrypted');

  if (typeof asana_email_encrypted === 'undefined') {
    const errorMessage = 'attachAppUserId - asana_email_encrypted was undefined';
    res.json({ error: errorMessage });
    throw new Error(errorMessage);
  }

  const asana_email_decrypted = encryptor.decrypt(asana_email_encrypted);

  const selectAppUserIdQuery = 'SELECT local_id FROM app_user WHERE asana_email = $1;';

  try {
    const app_user_id = await pgConfigured
      .one(selectAppUserIdQuery, asana_email_decrypted, (queryResult) => queryResult.local_id);
    req.app_user_id = app_user_id;
    next();
  } catch (error) {
    tryToRespondWithError(error, res);
  }
}
