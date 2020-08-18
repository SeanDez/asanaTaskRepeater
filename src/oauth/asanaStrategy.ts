import path from 'path';
import passport from 'passport';
import findAndPassUserToSerializer from './findUserCallback';

const AsanaStrategy: any = require('passport-asana').Strategy;

require('dotenv').config();

const callbackURL: string = `${process.env.ASANA_HTTPS_REDIRECT_URL}/oauth/callback`;

const asanaStrategy = new AsanaStrategy({
  clientID: process.env.ASANA_CLIENT_ID,
  clientSecret: process.env.ASANA_CLIENT_SECRET,
  callbackURL,
}, async (asanaAccessToken: any,
  asanaRefreshToken: any, asanaProfile: any, doneCallback: Function) => {
  await findAndPassUserToSerializer(asanaProfile.id, doneCallback);
});

passport.use(asanaStrategy); // referenced as 'Asana' in the route handler

export default passport;
