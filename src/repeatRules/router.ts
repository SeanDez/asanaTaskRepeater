import { Request, Response, Router } from 'express';
import { pgConfigured } from '../shared/database';
import { attachAppUserId } from '../attachHeadersToRequest/middleware';

const router = Router();

/*
  Add a new repeat rule to the database.
*/
router.post('/', attachAppUserId, async (req: Request, res: Response) => {
  const {
    projectGid: project_gid,
    projectName: project_name,
    taskGid: task_gid,
    taskName: task_name,
    timeInterval: repeat_interval,
    timeUnit: repeat_unit,
    startDateTime: start_timestamp, // todo on the FE,include a timezone.
  } = req.body;

  const insertQuery = 'INSERT INTO repeat_rule (project_gid, task_gid, repeat_interval, repeat_unit, start_timestamp, app_user_id, project_name, task_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;';

  try {
    await pgConfigured.one(insertQuery,
      [project_gid, task_gid, repeat_interval,
        repeat_unit, start_timestamp, req.app_user_id, project_name, task_name]);

    res.status(204).send();
  } catch (error) {
    throw new Error(error);
  }
});

/*
  Get all repeat rules for a user
*/
router.get('/all', attachAppUserId, async (req: Request, res: Response) => {
  const selectAllQuery = 'SELECT * FROM repeat_rule WHERE app_user_id = $1;';

  try {
    const dbResult = await pgConfigured.manyOrNone(selectAllQuery, req.app_user_id);
    res.status(200).json(dbResult);
  } catch (error) {
    throw new Error(error);
  }
});

/*
  updates a single rule
*/
router.patch('/', attachAppUserId, async (req: Request, res: Response) => {
  const updateQuery = 'UPDATE repeat_rule SET $1 = $2 WHERE local_id = $3 AND app_user_id = $4';
  const { updateColumn, newValue, localId } = req.body;

  try {
    await pgConfigured.none(updateQuery, [updateColumn, newValue, localId, req.app_user_id]);

    res.status(204).send();
  } catch (error) {
    throw new Error(error);
  }
});

/*
  deletes a repeat rule

  app_user_id condition is for verification only
*/
router.delete('/', attachAppUserId, async (req: Request, res: Response) => {
  const deleteByLocalIdQuery = 'DELETE FROM repeat_rule WHERE local_id = $1 AND app_user_id = $2';

  try {
    await pgConfigured.none(deleteByLocalIdQuery, [req.body.localId, req.app_user_id]);

    res.status(204).send();
  } catch (error) {
    throw new Error(error);
  }
});

export default router;
