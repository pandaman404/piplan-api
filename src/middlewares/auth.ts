import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities';
import { Role } from '../types';
import {
  BadRequestError,
  ForbiddenRequestError,
  NotFoundError,
  UnauthenticatedError,
} from '../responses/customApiError';
import {
  INVALID_TOKEN,
  NO_TOKEN_PROVIDED,
  TOKEN_EXPIRED,
  USER_NOT_FOUND,
  USER_UNAUTHORIZED,
} from '../responses/apiMessages';

export const validateToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.headers['token'];

  if (!token) throw new ForbiddenRequestError(NO_TOKEN_PROVIDED);

  const decoded: any = jwt.verify(
    token.toString(),
    process.env.JWT_SECRET ? process.env.JWT_SECRET : '',
    (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw new ForbiddenRequestError(TOKEN_EXPIRED);
        }
        throw new BadRequestError(INVALID_TOKEN);
      }
      return decoded;
    }
  );

  const userFound = await User.findOneBy({ id: Number(decoded.id) });
  if (!userFound) throw new NotFoundError(USER_NOT_FOUND);

  req.currentUser = userFound;

  next();
};

export const verifyIsAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<any> => {
  if (!req.currentUser || req.currentUser.role !== Role.ADMIN) {
    throw new UnauthenticatedError(USER_UNAUTHORIZED);
  }

  next();
};

export const verifyIsAdminOrManager = async (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<any> => {
  if (
    !req.currentUser ||
    (req.currentUser.role !== Role.ADMIN &&
      req.currentUser.role !== Role.MANAGER)
  ) {
    throw new UnauthenticatedError(USER_UNAUTHORIZED);
  }
  next();
};
