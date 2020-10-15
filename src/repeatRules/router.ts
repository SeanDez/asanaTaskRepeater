import { Request, Response, Router } from 'express';
import { pgConfigured } from '../shared/database';
import { attachAppUserId } from '../attachHeadersToRequest/middleware';

const router = Router();

/*
  Add a new repeat rule to the database.
*/
router.post('/add', attachAppUserId, async (req: Request, res: Response) => {
  const {
    projectGid: project_gid,
    taskGid: task_gid,
    timeInterval: repeat_interval,
    timeUnit: repeat_unit,
    startDate: start_timestamp, // todo on the FE,include a timezone.
  } = req.body;

  const insertQuery = 'INSERT INTO repeat_rule (project_gid, task_gid, repeat_interval, repeat_unit, start_timestamp, app_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;';

  try {
    await pgConfigured.one(insertQuery,
      [project_gid, task_gid, repeat_interval, repeat_unit, start_timestamp, req.app_user_id]);

    res.status(204).send();
  } catch (error) {
    res.status(500).json(error);
  }
});

// router.post('/delete', async (req: Request, res: Response) => {

// });

export default router;
