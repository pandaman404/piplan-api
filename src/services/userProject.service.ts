import { In } from 'typeorm';
import { User, Project, UserProject } from '../entities';
import { BadRequestError, NotFoundError } from '../responses/customApiError';
import { NewUserProject } from '../types';
import { validateParamIsNumber } from '../utils/validation';
import {
  INVALID_ID,
  INVALID_PROJECT_ID,
  INVALID_USER_ID,
  PROJECT_NOT_FOUND,
  REGISTER_NOT_FOUND,
  USERS_NOT_FOUND_IN_PROJECT,
  USERS_REGISTERED_IN_PROJECT,
  USER_NOT_FOUND,
  USER_REGISTERED_IN_PROJECT,
} from '../responses/apiMessages';

export const saveUsersProject = async (
  newUserProject: NewUserProject
): Promise<any> => {
  const { user_id, project_id } = newUserProject;
  const projectFounded = await Project.findOneBy({
    id: project_id,
    is_visible: true,
  });

  if (!projectFounded) throw new NotFoundError(PROJECT_NOT_FOUND);

  if (typeof user_id === 'number') {
    const userFounded = await User.findOneBy({ id: user_id, active: true });

    if (!userFounded) throw new NotFoundError(USER_NOT_FOUND);

    const userExistsInProject = await UserProject.findOneBy({
      user: { id: userFounded.id },
      project: { id: projectFounded.id },
    });

    if (userExistsInProject) {
      throw new BadRequestError(USER_REGISTERED_IN_PROJECT);
    }

    const userProject = new UserProject();
    userProject.project = projectFounded;
    userProject.user = userFounded;
    return await userProject.save();
  }

  if (user_id.length > 0) {
    const users = await User.find({
      where: {
        id: In(user_id),
      },
    });

    for (const user of users) {
      const userExistsInProject = await UserProject.findOneBy({
        user: { id: user.id },
        project: { id: projectFounded.id },
      });
      if (userExistsInProject) {
        throw new BadRequestError(USERS_REGISTERED_IN_PROJECT);
      }

      const userProject = new UserProject();
      userProject.user = user;
      userProject.project = projectFounded;
      await userProject.save();
    }
  }
};

export const deleteUserProjectItem = async (id: string): Promise<void> => {
  if (!validateParamIsNumber(id)) {
    throw new BadRequestError(INVALID_ID);
  }
  const userProject = await UserProject.findOneBy({ id: Number(id) });

  if (!userProject) throw new NotFoundError(REGISTER_NOT_FOUND);

  await UserProject.delete({ id: Number(id) });
};

export const findUsersByProject = async (
  project_id: string
): Promise<UserProject[]> => {
  if (!validateParamIsNumber(project_id)) {
    throw new BadRequestError(INVALID_PROJECT_ID);
  }

  const project = await Project.findOneBy({
    id: Number(project_id),
    is_visible: true,
  });

  if (!project) {
    throw new NotFoundError(PROJECT_NOT_FOUND);
  }

  const users = await UserProject.find({
    relations: {
      user: true,
    },
    where: { project: { id: Number(project_id), is_visible: true } },
  });

  if (users.length <= 0) {
    throw new NotFoundError(USERS_NOT_FOUND_IN_PROJECT);
  }

  return users;
};

export const findProjectsByUser = async (
  user_id: string
): Promise<UserProject[]> => {
  if (!validateParamIsNumber(user_id)) {
    throw new BadRequestError(INVALID_USER_ID);
  }

  const user = await User.findOneBy({ id: Number(user_id), active: true });

  if (!user) {
    throw new NotFoundError(USER_NOT_FOUND);
  }

  const projects = await UserProject.find({
    relations: {
      project: true,
    },
    where: { user: { id: Number(user_id), active: true } },
  });

  if (projects.length <= 0) {
    throw new NotFoundError(USERS_NOT_FOUND_IN_PROJECT);
  }

  return projects;
};
