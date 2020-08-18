/* eslint-disable no-console */
import { CronJob } from 'cron';

const everyTwoMinutes = '*/2 * * * *';

function logToConsoleOnTick() {
  console.log('Current Date.now(): ', Date.now());
}

try {
  console.log('Before job instantiation');
  const cronJob = new CronJob(everyTwoMinutes, logToConsoleOnTick);
  console.log('After job instantiation');
  cronJob.start();
} catch (error) {
  throw new Error(error);
}
