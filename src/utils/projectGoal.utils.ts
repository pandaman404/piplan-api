import { ProjectGoal } from '../entities';
import { NewProjectGoal, UpdateProjectGoal } from '../types';
import { parseBoolean, parseNum, parseString } from './validation';

export const toNewProjectGoal = (object: any): NewProjectGoal => {
  const { project_id, goal_name, goal_value } = object;

  const new_project_goal: NewProjectGoal = {
    project_id: parseNum(project_id, 'Project id'),
    goal_name: parseString(goal_name, 'goal name'),
    goal_value: parseNum(goal_value, 'goal value'),
  };
  return new_project_goal;
};

export const toUpdateProjectGoal = (object: any): UpdateProjectGoal => {
  const { goal_name, goal_value, is_completed } = object;

  const update_project_goal: UpdateProjectGoal = {
    goal_name:
      goal_name !== undefined ? parseString(goal_name, 'goal name') : null,
    goal_value:
      goal_value !== undefined ? parseNum(goal_value, 'goal value') : null,
    is_completed:
      is_completed !== undefined
        ? parseBoolean(is_completed, 'is completed')
        : null,
  };
  return update_project_goal;
};

export const removeRedundantInfoProjectGoal = (
  project_goals: ProjectGoal[]
): any => {
  const removeInfo = project_goals.map((goal) => {
    const {
      id: project_id,
      project_name,
      project_status,
      is_visible,
      department,
    } = goal.project;
    const { id, first_name, last_name, email, availability, job, role } =
      goal.project.user;

    return {
      ...goal,
      project: {
        project_id,
        project_name,
        project_status,
        is_visible,
        department,
      },
      creator: { id, first_name, last_name, email, availability, job, role },
    };
  });
  return removeInfo;
};

export const removeRedundantInfoOneProjectGoal = (
  project_goal: ProjectGoal
): any => {
  const {
    id: project_id,
    project_name,
    project_status,
    is_visible,
    department,
  } = project_goal.project;
  const { id, first_name, last_name, email, availability, job, role } =
    project_goal.project.user;

  return {
    ...project_goal,
    project: {
      project_id,
      project_name,
      project_status,
      is_visible,
      department,
    },
    creator: { id, first_name, last_name, email, availability, job, role },
  };
};

export const projectValueRestriction = async (
  project_id: Number,
  value: Number
): Promise<boolean> => {
  const project_goals = await ProjectGoal.find({
    where: {
      project: { id: Number(project_id) },
    },
  });

  const project_goal_value = project_goals.reduce((acc, curr) => {
    acc += Number(curr.goal_value);
    return acc;
  }, 0);

  if (project_goal_value >= 100) {
    return false;
  }

  const total = project_goal_value + Number(value);

  return total <= 100;
};
