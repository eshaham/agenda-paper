import { Request, Response, NextFunction } from 'express';
import { APRequest } from '../requests-types';

export const initializePayload = () => (req: Request, res: Response, next: NextFunction) => {
  const apRequest = <APRequest>req;
  apRequest.payload = apRequest.payload || {};
  next();
};
