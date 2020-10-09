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
  const asana_email_encrypted = req.get('asana_email_encrypted') as string;
  const asanaEmailDecrypted: string = encryptor.decrypt(asana_email_encrypted) as string;

  try {
    // check if the current access token is good. if not get a new token
    // todo get the locally saved repeat_rules
    // get the saved app_user data
    const tokenHandler = new TokenHandler(asanaEmailDecrypted, res);
    const accessToken: string = await tokenHandler.getValidAuthToken();

    const asanaRequest = new AsanaRequest(accessToken);
    const projectBriefs = await asanaRequest.get('/projects');

    res.status(200).json({ projectBriefs });
  } catch ({ name, message }) {
    res.status(500).json({ name, message });
  }
});

export default router;
