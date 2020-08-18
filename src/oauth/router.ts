/* eslint-disable no-unused-vars */
import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';
import passportWithAsanaStrategy from './asanaStrategy';
import { IEncryptedUserTableData } from './encryptedUserCreds';

dotenv.config();

const router = Router();

router.get(
  '/oauth',
  passportWithAsanaStrategy.authenticate('Asana'),
  (req: Request, res: Response) => { /* IGNORED */ },
);

router.get(
  '/oauth/callback',
  passportWithAsanaStrategy.authenticate('Asana',
    (req: Request, res: Response) => {
      // set user cookies, then redirect home
      // pass the asana object from req.user into a cookie

      const {
        asana_id, refresh_token_encrypted, access_token_encrypted,
      } = req.user as IEncryptedUserTableData;

      res
        .cookie('asana_id', asana_id)
        .cookie('asana_refresh_token_encrypted', refresh_token_encrypted)
        .cookie('asana_access_token_encrypted', access_token_encrypted)

        .redirect(process.env.FRONTEND_URL!);
    }),
);

export default router;
