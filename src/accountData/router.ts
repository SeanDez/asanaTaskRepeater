import dotenv from 'dotenv';
import 'es6-promise';
import { Router, Request, Response } from 'express';
import 'isomorphic-fetch';
import Encryptor from 'simple-encryptor';

import AsanaRequest from '../shared/AsanaRequest';
import StateHandler from '../shared/StateHandler';
import TokenHandler from '../shared/TokenHandler';

dotenv.config();
const { ENCRYPTOR_SECRET } = process.env;

const encryptor = Encryptor.createEncryptor(ENCRYPTOR_SECRET!);
const router = Router();

router.get('/all', async (req: Request, res: Response) => {
  const { asana_email_encrypted, asana_state: frontEndState } = req.cookies;
  const asanaEmailDecrypted: string = encryptor.decrypt(asana_email_encrypted) as string;

  try {
    // check if the current access token is good. if not get a new token
    // get the locally saved repeat_rules
    // get the saved app_user data
    console.log('req.cookies', req.cookies);
    console.log('number of cookies keys', Object.keys(req.cookies).length);

    const stateHandler = new StateHandler(asanaEmailDecrypted);
    const statesMatch: boolean = await stateHandler.frontEndMatchesStored(frontEndState);

    if (statesMatch) {
      const tokenHandler = new TokenHandler(asanaEmailDecrypted);
      const accessToken: string = await tokenHandler.getValidAuthToken();

      const asanaRequest = new AsanaRequest(accessToken);
      const projectBriefs = await asanaRequest.get('/projects');

      res.status(200).json({ projectBriefs });
    }

    res.status(401).json({ error: 'statesMatch was falsy' });
  } catch (error) {
    throw new Error(error);
  }
});

export default router;
