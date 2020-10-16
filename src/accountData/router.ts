import buildUrl from 'build-url';
import dotenv from 'dotenv';
import 'es6-promise';
import { Router, Request, Response } from 'express';
import 'isomorphic-fetch';
import moment from 'moment';
import Encryptor from 'simple-encryptor';

import { apiUrlBase } from '../shared/globals';
import addAuthToken from '../authTokenHandling/middleware';
import AsanaRequest from '../shared/AsanaRequest';
import { tryToRespondWithError } from '../errorHandling/respond';

dotenv.config();
const { ENCRYPTOR_SECRET } = process.env;

const encryptor = Encryptor.createEncryptor(ENCRYPTOR_SECRET!);
const router = Router();

interface ProjectCompact { gid: string, name: string, resource_type: string }
/*
  Get all projects and tasks
  Segment tasks by repeated tag (vs no tag)
*/
router.get('/all', addAuthToken, async (req: Request, res: Response) => {
  try {
    // todo get the locally saved repeat_rules
    // get the saved app_user data

    const asanaRequest = new AsanaRequest(req.verifiedAccessToken);
    const projectCompacts: ProjectCompact[] = (await asanaRequest.get('/projects')).data;

    const ninetyDaysBack = moment().subtract(90, 'days').format('YYYY-MM-DD[T]HH:MM:[00.000Z]');

    const taskPromises: Promise<any[]>[] = projectCompacts
      .map(async (projectBrief: ProjectCompact) => {
        const taskUrl = buildUrl(apiUrlBase, {
          path: '/tasks',
          queryParams: {
            project: projectBrief.gid,
            completed_since: ninetyDaysBack, // '2019-09-15T02:06:58.147Z'
            opt_fields: ['name', 'gid', 'notes', 'tags', 'projects', 'due_on', 'this.projects.name'].join(','),
          },
        });

        const tasksforOneProjectResponse = await fetch(taskUrl, {
          mode: 'cors',
          headers: {
            'content-type': 'x-www-form-urlencoded',
            authorization: `Bearer ${req.verifiedAccessToken}`,
          },
        });

        const tasks: any[] = (await tasksforOneProjectResponse.json()).data;
        return tasks;
      });

    const tasksResolved = await Promise.all(taskPromises);
    // array.flat() doesn't work in ts-node
    const flattenedTaskList = [].concat(...tasksResolved as any[]);

    // remove all records older than 90 days

    res.status(200).json({
      projectCompacts,
      tasksEnhanced: flattenedTaskList,
    });
  } catch (error) {
    tryToRespondWithError(error, res);
  }
});

export default router;
