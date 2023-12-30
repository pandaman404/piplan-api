import { Request, Response } from 'express';
import {
  addNewProjectGoal,
  deleteProjectGoalById,
  findProjectGoalByProjectId,
  updateProjectGoalById,
} from '../services/projectGoal.services';
import PiplanApiResponse from '../responses/piplanApiResponse';
import {
  PROJECT_GOAL_DELETED,
  PROJECT_GOAL_UPDATED,
} from '../responses/apiMessages';

export const getProjectGoalByProjectId = async (
  req: Request,
  res: Response
) => {
  const project_goal = await findProjectGoalByProjectId(
    req.params.id,
    req.currentUser
  );

  return PiplanApiResponse.successData(res, {
    nbHits: project_goal.length,
    project_goals: project_goal,
  });
};

export const createProjectGoal = async (req: Request, res: Response) => {
  const project_goal = await addNewProjectGoal(req.body, req.currentUser);
  return PiplanApiResponse.successData(res, { project_goal });
};

export const updateProjectGoal = async (req: Request, res: Response) => {
  const project_goal = await updateProjectGoalById(req, req.currentUser);

  return PiplanApiResponse.successDataAndMsg(
    res,
    { project_goal },
    PROJECT_GOAL_UPDATED
  );
};

export const deleteProjectGoal = async (req: Request, res: Response) => {
  await deleteProjectGoalById(req.params.id, req.currentUser);
  return PiplanApiResponse.successMsg(res, PROJECT_GOAL_DELETED);
};
