import { Request, Response, Router } from 'express';
import { pgOptioned, pgConfigured } from '../shared/database';
import { addEmailFromCookie } from '../emailCookieHandling/middleware';

const router = Router();

/*
  Add a new repeat rule to the database.
*/
router.post('/add', addEmailFromCookie, async (req: Request, res: Response) => {
  const {
    projectGid: project_gid,
    taskGid: task_gid,
    timeInterval: repeat_interval,
    timeUnit: repeat_unit,
    startDate: start_timestamp, // todo on the FE,include a timezone.
  } = req.body;

  const selectAppUserIdQuery = 'SELECT local_id FROM app_user WHERE asana_email = $1;';

  const insertQuery = 'INSERT INTO repeat_rules (project_gid, task_gid, repeat_interval, repeat_unit, start_timestamp, app_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';

  try {
    // todo fix the input variable for the app user id
    const app_user_id = await pgConfigured
      .one(selectAppUserIdQuery, req.asana_email_decrypted);

    const dbResult = await pgConfigured.one(insertQuery,
      [project_gid, task_gid, repeat_interval, repeat_unit, start_timestamp, app_user_id]);
  } catch (error) {
    res.json(error);
  }
});

// router.post('/delete', async (req: Request, res: Response) => {

// });

export default router;
