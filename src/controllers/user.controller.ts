import { Request, Response } from 'express';
import {
  deactivateUserAccount,
  findUserByFilters,
  findAllUsersByRole,
  loginUser,
  saveNewUser,
  updateUserInfoProfile,
} from '../services/user.service';
import PiplanApiResponse from '../responses/piplanApiResponse';
import { BadRequestError } from '../responses/customApiError';
import {
  MISSING_FIELDS,
  USER_DELETED,
  USER_UPDATED,
} from '../responses/apiMessages';

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await findAllUsersByRole(req.currentUser);
  return PiplanApiResponse.successData(res, {
    nbHits: users.length,
    users,
  });
};

export const getUser = async (req: Request, res: Response) => {
  if (!req.query || !req.query.email) throw new BadRequestError(MISSING_FIELDS);

  const users = await findUserByFilters({
    email: req.query.email.toString(),
  });

  return PiplanApiResponse.successData(res, {
    users,
  });
};

export const createUser = async (req: Request, res: Response) => {
  const savedUser = await saveNewUser(req.body);
  return PiplanApiResponse.successData(res, { user: savedUser });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) throw new BadRequestError(MISSING_FIELDS);

  const user = await loginUser(email, password);

  return PiplanApiResponse.successData(res, { user });
};

export const updateUserInfo = async (req: Request, res: Response) => {
  const userUpdated = await updateUserInfoProfile(
    req.currentUser,
    req.params.id,
    req.body
  );
  return PiplanApiResponse.successDataAndMsg(
    res,
    { user: userUpdated },
    USER_UPDATED
  );
};

export const deactivateAccount = async (req: Request, res: Response) => {
  await deactivateUserAccount(req.params.id);
  return PiplanApiResponse.successMsg(res, USER_DELETED);
};

export const updateUserPassword = async (_: Request, res: Response) => {
  return PiplanApiResponse.successMsg(res, 'PROXIMAMENTE...');
};
