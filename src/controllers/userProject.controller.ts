import { Request, Response } from 'express';
import PiplanApiResponse from '../responses/piplanApiResponse';
import {
  deleteUserProjectItem,
  findProjectsByUser,
  findUsersByProject,
  saveUsersProject,
} from '../services/userProject.service';
import { isNumber, validateIsArrayOfTypeNumber } from '../utils/validation';
import { BadRequestError } from '../responses/customApiError';
import {
  ADD_USER_TO_PROJECT,
  MISSING_FIELDS,
  REMOVE_USER_FROM_PROJECT,
} from '../responses/apiMessages';

export const getUsersByProject = async (req: Request, res: Response) => {
  const users = await findUsersByProject(req.params.id);
  return PiplanApiResponse.successData(res, {
    nbHits: users.length,
    users,
  });
};

export const getProjectsByUser = async (req: Request, res: Response) => {
  const projects = await findProjectsByUser(req.params.id);
  return PiplanApiResponse.successData(res, {
    nbHits: projects.length,
    projects,
  });
};

export const addUserToProject = async (req: Request, res: Response) => {
  const { user_id, project_id } = req.body;
  if (
    !user_id ||
    !project_id ||
    !isNumber(project_id) ||
    (!Array.isArray(user_id) && !isNumber(user_id)) ||
    (Array.isArray(user_id) && !validateIsArrayOfTypeNumber(user_id))
  ) {
    throw new BadRequestError(MISSING_FIELDS);
  }

  await saveUsersProject(req.body);
  return PiplanApiResponse.successMsg(res, ADD_USER_TO_PROJECT);
};

export const removeUserFromProject = async (req: Request, res: Response) => {
  await deleteUserProjectItem(req.params.id);
  return PiplanApiResponse.successMsg(res, REMOVE_USER_FROM_PROJECT);
};
