import 'es6-promise';
import 'isomorphic-fetch';
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/all', (req: Request, res: Response) => {
  const { asana_id } = req.cookies;

  // grab all asana project and task data
  // grab all local repeat_rule's

  try {
    // check if the current access token is good. if not get a new token
    // get the locally saved repeat_rules
    // get the saved app_user data

  } catch (error) {
    throw new Error(error);
  }
});

export default router;
