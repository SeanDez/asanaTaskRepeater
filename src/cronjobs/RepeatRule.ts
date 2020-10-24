import buildUrl from 'build-url';
import moment from 'moment';
import { apiUrlBase } from '../shared/globals';
import ITask from '../shared/interfaces/ITask';

export default class RepeatRule {
  constructor(
    public taskGid: string,
    public projectGid: string,
    public timeInterval: number,
    public timeUnit: 'days' | 'weeks' | 'months',
    public startDate: string,
  ) {}

  /* determines if the rule applies today or not */
  public appliesToday(): boolean {
    const today = moment().startOf('day');
    const startDate = moment(this.startDate).startOf('day');
    const alldates: moment.Moment[] = [];

    let dateIterator = startDate;

    // push the start date, and then increment the pointer
    do {
      alldates.push(dateIterator);

      const oneIncrementForward = moment(dateIterator)
        .add(this.timeInterval, this.timeUnit);
      dateIterator = oneIncrementForward;
    } while (dateIterator.isBefore(today));

    // if the loop breaks on today, then return true. else false
    if (dateIterator.isSame(today)) {
      return true;
    }

    return false;
  }

  /* lookup an original task to get its properties for copying
    The full task information set is returned
    See the asana docs under GET /tasks/{taskGid}
  */
  public async lookupOriginal(verifiedAccessToken: string): Promise<ITask> {
    const taskEndpoint = buildUrl(apiUrlBase, {
      path: `/tasks/${this.taskGid}`,
    });

    try {
      const response = await fetch(taskEndpoint, {
        method: 'get',
        mode: 'cors',
        headers: {
          'content-type': 'x-www-form-urlencoded',
          authorization: `Bearer ${verifiedAccessToken}`,
        },
      });

      const task: ITask = (await response.json()).data;
      return task;
    } catch (error) {
      throw new Error(error);
    }
  }
}
