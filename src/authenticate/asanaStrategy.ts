import path from 'path';
import passport from 'passport';
import Encryptor from 'simple-encryptor';
import findAndPassUserToSerializer from './findUserCallback';
import { IEncryptedUserTableData } from './encryptedUserCreds';

const AsanaStrategy: any = require('passport-asana').Strategy;

require('dotenv').config();

const encryptor = Encryptor.createEncryptor(process.env.ENCRYPTOR_SECRET!);

const callbackURL: string = process.env.ASANA_HTTPS_REDIRECT_URL!;

const asanaStrategy = new AsanaStrategy({
  clientID: process.env.ASANA_CLIENT_ID,
  clientSecret: process.env.ASANA_CLIENT_SECRET,
  callbackURL,
}, async (
  asanaAccessToken: any, asanaRefreshToken: any, asanaProfile: any, doneCallback: Function) => {
  const { email, gid, name } = asanaProfile._json;

  const dataForUserTable: IEncryptedUserTableData = {
    /* eslint-disable no-underscore-dangle */
    gid,
    asana_email: email,
    display_name: name,
    refresh_token_encrypted: encryptor.encrypt(asanaRefreshToken),
    access_token_encrypted: encryptor.encrypt(asanaAccessToken),
  };

  await findAndPassUserToSerializer(dataForUserTable, doneCallback);
});

passport.use(asanaStrategy); // referenced as 'Asana' in the route handler

export default passport;
