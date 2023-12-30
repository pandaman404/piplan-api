import { parseString, parseDate, parseEnum, parseNum } from './validation';
import {
  ProjectStatus,
  NewProject,
  UpdateProject,
  FiltersProject,
  DateType,
} from '../types';
import { Project } from '../entities';

export const toFilterProject = (object: any): FiltersProject => {
  const { date_type, start, end, status, department } = object;
  const filter_project: FiltersProject = {
    date_type:
      date_type !== undefined
        ? parseEnum(date_type, DateType, 'Date type')
        : null,
    start: start !== undefined ? parseDate(start, 'start range date') : null,
    end: end !== undefined ? parseDate(end, 'end range date') : null,
    status:
      status !== undefined
        ? parseEnum(status, ProjectStatus, 'Project status')
        : null,
    department:
      department !== undefined ? parseString(department, 'department ') : null,
  };
  return filter_project;
};

export const toNewProject = (object: any): NewProject => {
  const new_project: NewProject = {
    project_name: parseString(object.project_name, 'project name'),
    start_date: parseDate(object.start_date, 'start date'),
    end_date:
      object.end_date !== undefined
        ? parseDate(object.end_date, 'end date')
        : null,
    estimated_end_date:
      object.estimated_end_date !== undefined
        ? parseDate(object.estimated_end_date, 'estimated end date')
        : null,
    project_status: parseEnum(
      object.project_status,
      ProjectStatus,
      'project status'
    ),
    userId: parseNum(object.userId, 'user id'),
    department_id: parseNum(object.department_id_by_role, 'department id'),
  };

  return new_project;
};

export const toUpdatedProject = (object: any): UpdateProject => {
  const { project_name, end_date, estimated_end_date, project_status } = object;
  const updated_project: UpdateProject = {
    project_name:
      project_name !== undefined
        ? parseString(project_name, 'project name')
        : null,
    end_date: end_date !== undefined ? parseDate(end_date, 'end date') : null,
    estimated_end_date:
      estimated_end_date !== undefined
        ? parseDate(estimated_end_date, 'estimated end date')
        : null,
    project_status:
      project_status !== undefined
        ? parseEnum(project_status, ProjectStatus, 'project status')
        : null,
  };

  return updated_project;
};

export const removeRedundantInfoProject = (projects: Project[]): any => {
  const removeUserDepartment = projects.map((project) => {
    const {
      id: user_id,
      first_name,
      last_name,
      email,
      availability,
      job,
      role,
    } = project.user;
    if (!project.department) {
      return {
        ...project,
        user: {
          user_id,
          first_name,
          last_name,
          email,
          availability,
          job,
          role,
        },
      };
    }

    const { id: department_id, department_name } = project.department;

    return {
      ...project,
      user: {
        user_id,
        first_name,
        last_name,
        email,
        availability,
        job,
        role,
      },
      department: { department_id, department_name },
    };
  });
  return removeUserDepartment;
};

export const removeRedundantInfoOneProject = (project: Project): any => {
  const {
    id: user_id,
    first_name,
    last_name,
    email,
    availability,
    job,
    role,
  } = project.user;
  if (!project.department) {
    return {
      ...project,
      user: {
        user_id,
        first_name,
        last_name,
        email,
        availability,
        job,
        role,
      },
    };
  }

  const { id: department_id, department_name } = project.department;

  return {
    ...project,
    user: {
      user_id,
      first_name,
      last_name,
      email,
      availability,
      job,
      role,
    },
    department: { department_id, department_name },
  };
};
