import cron from 'cron';
import ProcessController from './ProcessController';

try {
  const dailyDuplicationScan = new cron.CronJob('* */24 * * *', async () => {
    const processController = new ProcessController();
    await processController.asyncInit();
    await processController.copyQualifiedTasksForAll();
  });
} catch (error) {
  throw new Error(error);
}
