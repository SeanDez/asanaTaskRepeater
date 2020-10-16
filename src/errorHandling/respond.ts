import { Response } from 'express';

/*
  To be used mostly inside catch blocks

  catch blocks can't catch throws. Only try blocks can

  This means nested try blocks inside catch blocks are helpful when the catch code can also throw

  Below, there is always a chance the response object causes another throw
*/
export function tryToRespondWithError(error: any, res: Response) {
  try {
    res.status(500).json({ error });
  } catch (resRelatedError) {
    throw new Error(resRelatedError);
  }
}
