import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import PiplanApiResponse from '../responses/piplanApiResponse';
import {
  CONFLICT_DELETE_RECORD,
  CONFLICT_EMAIL_IN_USE,
} from '../responses/apiMessages';

const errorHandlerMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (
    (err.code && err.code == '23503') ||
    (process.env.NODE_ENV === 'test' &&
      err.code &&
      err.code === 'SQLITE_CONSTRAINT')
  ) {
    return PiplanApiResponse.error(
      res,
      StatusCodes.CONFLICT,
      CONFLICT_DELETE_RECORD
    );
  }

  if (err.code && err.code == '23505' && err.detail.includes('(email)=')) {
    return PiplanApiResponse.error(
      res,
      StatusCodes.CONFLICT,
      CONFLICT_EMAIL_IN_USE
    );
  }

  return PiplanApiResponse.error(
    res,
    err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    err.message
  );
};

export default errorHandlerMiddleware;
