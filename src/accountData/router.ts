import dotenv from 'dotenv';
import 'es6-promise';
import { Router, Request, Response } from 'express';
import 'isomorphic-fetch';
import Encryptor from 'simple-encryptor';

import StateHandler from '../shared/StateHandler';

dotenv.config();
const { ENCRYPTOR_SECRET } = process.env;

const encryptor = Encryptor.createEncryptor(ENCRYPTOR_SECRET!);
const router = Router();

router.get('/all', async (req: Request, res: Response) => {
  const { asana_email_encrypted, asana_state: frontEndState } = req.cookies;
  const asanaEmailDecrypted = encryptor.decrypt(asana_email_encrypted);

  try {
    // check if the current access token is good. if not get a new token
    // get the locally saved repeat_rules
    // get the saved app_user data
    const stateHandler = new StateHandler(asanaEmailDecrypted);
    const statesMatch = stateHandler.frontEndMatchesStored(frontEndState);

    if (statesMatch) {
      
    }

  } catch (error) {
    throw new Error(error);
  }
});

export default router;
