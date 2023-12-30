import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import PiplanApiResponse from '../responses/piplanApiResponse';
import { ROUTE_NOT_FOUND } from '../responses/apiMessages';

const notFound = (_req: Request, res: Response) =>
  PiplanApiResponse.error(res, StatusCodes.NOT_FOUND, ROUTE_NOT_FOUND);

export default notFound;
