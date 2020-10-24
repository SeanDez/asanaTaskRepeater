import moment from 'moment';

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
}
