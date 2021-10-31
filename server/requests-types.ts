import { Request } from 'express';

export interface APRequest extends Request {
  payload: Record<string, unknown>;
}
