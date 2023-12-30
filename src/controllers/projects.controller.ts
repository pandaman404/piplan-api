import { Request, Response } from 'express';
import {
  addNewProject,
  findProjects,
  findProjectById,
  filterProjects,
  hideProjectById,
  updateProjectById,
} from '../services/project.services';
import { removeRedundantInfoProject } from '../utils/project.utils';
import PiplanApiResponse from '../responses/piplanApiResponse';
import { PROJECT_DELETED, PROJECT_UPDATED } from '../responses/apiMessages';

export const getAllProjects = async (req: Request, res: Response) => {
  const projects = await findProjects(req.currentUser);
  removeRedundantInfoProject(projects);
  return PiplanApiResponse.successData(res, {
    nbHits: projects.length,
    projects,
  });
};

export const getOneProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await findProjectById(id, req.currentUser);

  return PiplanApiResponse.successData(res, { project });
};

export const getFilteredProject = async (req: Request, res: Response) => {
  const { start, end, status, department, date_type } = req.query;

  const query_params = {
    start: start?.toString(),
    end: end?.toString(),
    status: status?.toString(),
    department: department,
    date_type: date_type?.toString(),
    current_user: req.currentUser,
  };

  const projects = await filterProjects(query_params);

  return PiplanApiResponse.successDataAndMsg(
    res,
    { nbHits: projects.projects.length, projects: projects.projects },
    projects.aditional_info
  );
};

export const createProject = async (req: Request, res: Response) => {
  const {
    project_name,
    start_date,
    end_date,
    estimated_end_date,
    project_status,
    department_id,
  } = req.body;
  const properties = {
    project_name,
    start_date,
    end_date,
    estimated_end_date,
    project_status,
    userId: req.currentUser.id,
    department_id,
  };
  const created_project = await addNewProject(properties, req.currentUser);
  return PiplanApiResponse.successData(res, { project: created_project });
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  const update_project = await updateProjectById(
    { ...req.body, id },
    req.currentUser
  );

  return PiplanApiResponse.successDataAndMsg(
    res,
    { project: update_project },
    PROJECT_UPDATED
  );
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  await hideProjectById(id, req.currentUser);

  return PiplanApiResponse.successMsg(res, PROJECT_DELETED);
};
