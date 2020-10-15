import { Request } from 'express';

export interface RequestWithToken extends Request {
  verifiedAccessToken: string;
}
