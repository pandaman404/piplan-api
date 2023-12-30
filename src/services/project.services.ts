import { Role } from '../types';
import {
  removeRedundantInfoOneProject,
  removeRedundantInfoProject,
  toFilterProject,
  toNewProject,
  toUpdatedProject,
} from '../utils/project.utils';
import { Project, User, Department } from '../entities';
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from '../responses/customApiError';
import { Between } from 'typeorm';
import { validateParamIsNumber } from '../utils/validation';
import {
  DEPARTMENT_NOT_FOUND,
  FILTERS_APPLIED,
  INVALID_DATES,
  INVALID_DEPARTMENT_ID,
  INVALID_PROJECT_ID,
  INVALID_USER_ID,
  MANAGER_DEPARTMENT_NOT_EQUAL_AS_PROJECT_DEPARTMENT,
  MISSING_FIELDS,
  NO_FILTER_APPLIED,
  PROJECT_NOT_FOUND,
  UNAUTHORIZED_USER_TO_ACCESS_THE_PROJECT,
  USER_NOT_FOUND,
} from '../responses/apiMessages';

export const findProjects = async (currentUser: User): Promise<Project[]> => {
  if (currentUser.role === Role.EMPLOYEE) {
    const project_by_department = currentUser.department
      ? await Project.find({
          where: {
            department: { id: currentUser.department.id },
            is_visible: true,
          },
        })
      : [];
    return removeRedundantInfoProject(project_by_department);
  }
  const all_projects = await Project.find({ where: { is_visible: true } });

  return removeRedundantInfoProject(all_projects);
};

export const findProjectById = async (
  id: string,
  current_user: User
): Promise<Project> => {
  if (!validateParamIsNumber(id)) {
    throw new BadRequestError(INVALID_PROJECT_ID);
  }

  const project_by_id = await Project.findOneBy({
    id: Number(id),
    is_visible: true,
  });

  if (!project_by_id) {
    throw new NotFoundError(PROJECT_NOT_FOUND);
  }

  if (current_user.department.id !== project_by_id.department.id) {
    throw new UnauthenticatedError(UNAUTHORIZED_USER_TO_ACCESS_THE_PROJECT);
  }
  return removeRedundantInfoOneProject(project_by_id);
};

export const filterProjects = async ({
  start,
  end,
  status,
  department,
  date_type,
  current_user,
}: any): Promise<{ aditional_info: string; projects: Project[] }> => {
  let filters: any = { where: { is_visible: true } };

  if (!start && !end && !status && !department && !date_type) {
    if (current_user.role === Role.EMPLOYEE) {
      filters.where.department = { id: current_user.department.id };
    }
    const all_projects = await Project.find(filters);
    return {
      aditional_info: NO_FILTER_APPLIED,
      projects: removeRedundantInfoProject(all_projects),
    };
  }

  const correct_types = toFilterProject({
    start,
    end,
    status,
    date_type,
    department,
  });

  if (current_user.role === Role.EMPLOYEE) {
    filters.where.department = { id: current_user.department.id };
  }

  if (
    correct_types.department &&
    (current_user.role === Role.ADMIN || current_user.role === Role.MANAGER)
  ) {
    const find_department = await Department.findOneBy({
      id: Number(correct_types.department),
    });
    if (!find_department) {
      throw new NotFoundError(DEPARTMENT_NOT_FOUND);
    }
    filters.where.department = { id: Number(correct_types.department) };
  }

  if (
    (!correct_types.date_type && (correct_types.start || correct_types.end)) ||
    (correct_types.date_type && (!correct_types.start || !correct_types.end))
  ) {
    throw new BadRequestError(INVALID_DATES);
  }

  if (correct_types.start && correct_types.end && correct_types.date_type) {
    filters.where[date_type] = Between(
      new Date(correct_types.start),
      new Date(correct_types.end)
    );
  }

  if (correct_types.status) {
    filters.where.project_status = correct_types.status;
  }

  const filtered_projects = await Project.find(filters);

  return {
    aditional_info: FILTERS_APPLIED,
    projects: removeRedundantInfoProject(filtered_projects),
  };
};

export const addNewProject = async (
  properties: any,
  currentUser: User
): Promise<Project> => {
  const {
    project_name,
    start_date,
    end_date,
    estimated_end_date,
    project_status,
    userId,
    department_id,
  } = properties;

  let department_id_by_role;

  if (
    currentUser.role === Role.ADMIN &&
    (department_id === undefined || department_id === null)
  ) {
    throw new BadRequestError(INVALID_DEPARTMENT_ID);
  }

  if (currentUser.role === Role.ADMIN) {
    department_id_by_role = department_id;
  }
  if (currentUser.role === Role.MANAGER) {
    department_id_by_role = currentUser.department.id;
  }

  const correct_types = toNewProject({
    project_name,
    start_date,
    end_date,
    estimated_end_date,
    project_status,
    userId,
    department_id_by_role,
  });

  if (!correct_types.userId) {
    throw new BadRequestError(INVALID_USER_ID);
  }

  const created_project = new Project();
  const user = await User.findOneBy({ id: Number(correct_types.userId) });
  const department = await Department.findOneBy({
    id: Number(correct_types.department_id),
  });

  created_project.project_name = correct_types.project_name;
  created_project.start_date = correct_types.start_date;
  if (correct_types.end_date !== null) {
    created_project.end_date = correct_types.end_date;
  }
  if (correct_types.estimated_end_date !== null) {
    created_project.estimated_end_date = correct_types.estimated_end_date;
  }
  created_project.project_status = project_status;

  if (!user) {
    throw new NotFoundError(USER_NOT_FOUND);
  }

  created_project.user = user;

  if (!department) {
    throw new NotFoundError(DEPARTMENT_NOT_FOUND);
  }

  created_project.department = department;

  await created_project.save();
  return created_project;
};

export const updateProjectById = async (
  properties: any,
  current_user: User
): Promise<Project> => {
  const { project_name, end_date, estimated_end_date, project_status, id } =
    properties;

  if (!validateParamIsNumber(id)) {
    throw new BadRequestError(INVALID_PROJECT_ID);
  }

  const correct_types = toUpdatedProject({
    project_name,
    end_date,
    estimated_end_date,
    project_status,
  });

  if (correct_types === null) {
    throw new BadRequestError(MISSING_FIELDS);
  }

  const update_project = await Project.findOneBy({
    id: Number(id),
    is_visible: true,
  });

  if (update_project === null) {
    throw new NotFoundError(PROJECT_NOT_FOUND);
  }

  if (
    current_user.role === Role.MANAGER &&
    update_project.department.id !== current_user.department.id
  ) {
    throw new UnauthenticatedError(
      MANAGER_DEPARTMENT_NOT_EQUAL_AS_PROJECT_DEPARTMENT
    );
  }

  if (correct_types.project_name !== null) {
    update_project.project_name = correct_types.project_name;
  }

  if (correct_types.end_date !== null) {
    update_project.end_date = correct_types.end_date;
  }

  if (correct_types.estimated_end_date !== null) {
    update_project.estimated_end_date = correct_types.estimated_end_date;
  }

  if (correct_types.project_status !== null) {
    update_project.project_status = correct_types.project_status;
  }

  await update_project.save();
  return removeRedundantInfoOneProject(update_project);
};

export const hideProjectById = async (
  id: any,
  current_user: User
): Promise<Project> => {
  if (!validateParamIsNumber(id)) {
    throw new BadRequestError(INVALID_PROJECT_ID);
  }

  const delete_project = await Project.findOneBy({
    id: Number(id),
    is_visible: true,
  });

  if (delete_project === null) {
    throw new NotFoundError(PROJECT_NOT_FOUND);
  }

  if (
    current_user.role === Role.MANAGER &&
    delete_project.department.id !== current_user.department.id
  ) {
    throw new UnauthenticatedError(
      MANAGER_DEPARTMENT_NOT_EQUAL_AS_PROJECT_DEPARTMENT
    );
  }

  delete_project.is_visible = false;

  await delete_project.save();
  return delete_project;
};
