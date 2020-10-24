/* eslint-disable no-undef */
import RepeatRule from '../RepeatRule';

test('appliesToday', () => {
  const startDate = '2020-09-08T00:00:00-05:00';

  const repeatRule = new RepeatRule('', '', 1, 'days', startDate);
  const result = repeatRule.appliesToday();

  // a day that fails
  expect(result).toStrictEqual(true);

  const repeatRule2 = new RepeatRule('', '', 188, 'days', startDate);
  const result2 = repeatRule2.appliesToday();

  expect(result2).toStrictEqual(false);
});
