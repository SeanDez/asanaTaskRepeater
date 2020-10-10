import buildUrl from 'build-url';
import dotenv from 'dotenv';
import 'es6-promise';
import { Router, Request, Response } from 'express';
import 'isomorphic-fetch';
import Encryptor from 'simple-encryptor';

import { apiUrlBase } from '../shared/globals';
import addAuthToken from '../authTokenHandling/middleware';
import { RequestWithToken } from '../authTokenHandling/RequestWithToken';
import AsanaRequest from '../shared/AsanaRequest';
import StateHandler from '../shared/StateHandler';
import TokenHandler from '../authTokenHandling/TokenHandler';

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

    const taskPromises: Promise<any[]>[] = projectCompacts
      .map(async (projectBrief: ProjectCompact) => {
        const taskUrl = buildUrl(apiUrlBase, {
          path: '/tasks',
          queryParams: {
            project: projectBrief.gid,
            opt_fields: ['notes', 'tags', 'projects', 'due_on', 'this.projects.name'].join(','),
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

    res.status(200).json({
      projectCompacts,
      tasksEnhanced: flattenedTaskList,
    });
  } catch ({ name, message }) {
    res.status(500).json({ name, message });
  }
});

export default router;
