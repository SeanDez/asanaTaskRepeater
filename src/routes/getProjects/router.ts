import 'es6-promise';
import 'isomorphic-fetch';
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/projects', (req: Request, res: Response) => {
  const { asana_id } = req.body;

  // check for auth token
  
  // check for valid refresh token
});
