import { User, Project, ProjectGoal } from '../entities';

import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from '../responses/customApiError';
import { Role } from '../types';
import { validateParamIsNumber } from '../utils/validation';

import {
  projectValueRestriction,
  removeRedundantInfoOneProjectGoal,
  removeRedundantInfoProjectGoal,
  toNewProjectGoal,
  toUpdateProjectGoal,
} from '../utils/projectGoal.utils';
import {
  INVALID_PROJECT_GOAL_ID,
  INVALID_PROJECT_GOAL_VALUE,
  INVALID_PROJECT_ID,
  MANAGER_DEPARTMENT_NOT_EQUAL_AS_PROJECT_DEPARTMENT,
  MISSING_FIELDS,
  NO_PROJECT_GOAL_ASSOCIATED_TO_THIS_PROJECT,
  PROJECT_GOAL_NOT_FOUND,
  PROJECT_NOT_FOUND,
  UNAUTHORIZED_USER_TO_ACCESS_THE_PROJECT,
} from '../responses/apiMessages';

export const findProjectGoalByProjectId = async (
  project_id: string,
  current_user: User
): Promise<ProjectGoal[]> => {
  if (!validateParamIsNumber(project_id)) {
    throw new BadRequestError(INVALID_PROJECT_ID);
  }

  const project_by_id = await Project.findOneBy({
    id: Number(project_id),
    is_visible: true,
  });

  if (!project_by_id) {
    throw new NotFoundError(PROJECT_NOT_FOUND);
  }

  const project_goal = await ProjectGoal.find({
    where: {
      project: { id: Number(project_id) },
    },
  });

  if (project_goal.length <= 0) {
    throw new NotFoundError(NO_PROJECT_GOAL_ASSOCIATED_TO_THIS_PROJECT);
  }

  if (
    current_user.role === Role.EMPLOYEE &&
    current_user.department.id !== project_by_id.department.id
  ) {
    throw new UnauthenticatedError(UNAUTHORIZED_USER_TO_ACCESS_THE_PROJECT);
  }
  return removeRedundantInfoProjectGoal(project_goal);
};

export const addNewProjectGoal = async (
  properties: any,
  current_user: User
): Promise<ProjectGoal> => {
  const { project_id, goal_name, goal_value } = properties;

  if (!project_id || !goal_name || !goal_value) {
    throw new BadRequestError(MISSING_FIELDS);
  }
  const correct_types = toNewProjectGoal({ project_id, goal_name, goal_value });

  const project = await Project.findOneBy({
    id: Number(correct_types.project_id),
    is_visible: true,
  });

  if (!project) {
    throw new NotFoundError(PROJECT_NOT_FOUND);
  }

  if (
    current_user.role === Role.MANAGER &&
    project.department.id !== current_user.department.id
  ) {
    throw new UnauthenticatedError(
      MANAGER_DEPARTMENT_NOT_EQUAL_AS_PROJECT_DEPARTMENT
    );
  }

  const valid_value = await projectValueRestriction(
    correct_types.project_id,
    correct_types.goal_value
  );

  if (!valid_value) {
    throw new BadRequestError(INVALID_PROJECT_GOAL_VALUE);
  }

  const create_project_goal = new ProjectGoal();
  create_project_goal.goal_name = correct_types.goal_name;
  create_project_goal.goal_value = correct_types.goal_value;
  create_project_goal.project = project;
  await create_project_goal.save();
  return removeRedundantInfoOneProjectGoal(create_project_goal);
};

export const updateProjectGoalById = async (
  properties: any,
  current_user: User
): Promise<ProjectGoal> => {
  const {
    body: { goal_name, goal_value, is_completed },
    params: { id },
  } = properties;
  if (!validateParamIsNumber(id)) {
    throw new BadRequestError(INVALID_PROJECT_GOAL_ID);
  }

  const correct_types = toUpdateProjectGoal({
    goal_name,
    goal_value,
    is_completed,
  });

  const update_project_goal = await ProjectGoal.findOneBy({
    id: Number(id),
    project: { is_visible: true },
  });

  if (!update_project_goal) {
    throw new NotFoundError(PROJECT_GOAL_NOT_FOUND);
  }

  if (
    current_user.role === Role.MANAGER &&
    current_user.department.id !== update_project_goal.project.department.id
  ) {
    throw new UnauthenticatedError(
      MANAGER_DEPARTMENT_NOT_EQUAL_AS_PROJECT_DEPARTMENT
    );
  }

  if (correct_types.goal_name !== null) {
    update_project_goal.goal_name = correct_types.goal_name;
  }

  if (correct_types.goal_value !== null) {
    const valid_value = await projectValueRestriction(
      update_project_goal.project.id,
      correct_types.goal_value
    );

    if (!valid_value) {
      throw new BadRequestError(INVALID_PROJECT_GOAL_VALUE);
    }
    update_project_goal.goal_value = correct_types.goal_value;
  }

  if (correct_types.goal_name !== null) {
    update_project_goal.goal_name = correct_types.goal_name;
  }

  if (correct_types.is_completed !== null) {
    update_project_goal.is_completed = correct_types.is_completed;
  }

  await update_project_goal.save();
  return removeRedundantInfoOneProjectGoal(update_project_goal);
};

export const deleteProjectGoalById = async (
  project_goal_id: string,
  current_user: User
) => {
  if (!validateParamIsNumber(project_goal_id)) {
    throw new BadRequestError(INVALID_PROJECT_GOAL_ID);
  }

  const project_goal = await ProjectGoal.findOneBy({
    id: Number(project_goal_id),
    project: { is_visible: true },
  });

  if (!project_goal) {
    throw new NotFoundError(PROJECT_GOAL_NOT_FOUND);
  }
  if (
    current_user.role === Role.MANAGER &&
    current_user.department.id !== project_goal.project.department.id
  ) {
    throw new UnauthenticatedError(
      MANAGER_DEPARTMENT_NOT_EQUAL_AS_PROJECT_DEPARTMENT
    );
  }

  await ProjectGoal.delete({ id: Number(project_goal_id) });
};
