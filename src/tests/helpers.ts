import app from '../app';
import request from 'supertest';
import { AppDataSource } from '../db/db';
import { User } from '../entities';

export const apiRequest = request(app);

export const initialAdminUser = {
  rut: '18178388-5',
  first_name: 'test',
  last_name: 'test',
  email: 'bigboss@test.cl',
  password: '12345',
  phone: '123456789',
  job: 'CEO',
  role: 'admin',
};

export const initialDepartments = [
  {
    department_name: 'testDepartment',
  },
  {
    department_name: 'QA',
  },
  {
    department_name: 'emptyDepartment',
  },
];

export const initialUsers = [
  {
    rut: '14758087-8',
    first_name: 'test',
    last_name: 'test',
    email: 'managerDepartment2@test.cl',
    password: '12345',
    phone: '123456789',
    job: 'QA',
    role: 'manager',
    department_id: 2,
  },

  {
    rut: '14776044-2',
    first_name: 'test',
    last_name: 'test',
    email: 'employeeDepartment1@test.cl',
    password: '12345',
    phone: '123456789',
    job: 'QA',
    role: 'employee',
    department_id: 1,
  },
  {
    rut: '15868253-2',
    first_name: 'test',
    last_name: 'test',
    email: 'employeeDepartment2@test.cl',
    password: '12345',
    phone: '123456789',
    job: 'QA',
    role: 'employee',
    department_id: 2,
  },
];

// al ser creados por admin, se le debe asignar el id del departamento al que pertenece

export const initialProjects = [
  {
    project_name: 'test project department 1',
    start_date: '2023-07-27',
    end_date: '2023-07-30',
    estimated_end_date: '2024-01-01',
    project_status: 'completed',
    department_id: 1,
  },
  {
    project_name: 'test project department 1',
    start_date: '2023-08-15',
    end_date: '2023-09-20',
    estimated_end_date: '2023-10-01',
    project_status: 'in progress',
    department_id: 1,
  },
  {
    project_name: 'test project department 2',
    start_date: '2023-07-27',
    end_date: '2023-07-30',
    estimated_end_date: '2023-08-01',
    project_status: 'in progress',
    department_id: 2,
  },
];

const initialUsersProject = [
  {
    user_id: 3,
    project_id: 1,
  },
  { user_id: 4, project_id: 3 },
];

const initialProjectsGoals = [
  {
    project_id: 1,
    goal_name: 'test project goal project 1',
    goal_value: 50,
  },
  {
    project_id: 1,
    goal_name: 'test project goal project 1',
    goal_value: 25,
  },
  {
    project_id: 2,
    goal_name: 'test project goal project 2',
    goal_value: 20,
  },
  {
    project_id: 2,
    goal_name: 'test project goal project 2',
    goal_value: 11,
  },
  {
    project_id: 2,
    goal_name: 'test project goal project 2',
    goal_value: 1,
  },
];

const createInitialUser = async () => {
  const user = new User();
  user.rut = initialAdminUser.rut;
  user.first_name = initialAdminUser.first_name;
  user.last_name = initialAdminUser.last_name;
  user.email = initialAdminUser.email;
  user.password = initialAdminUser.password;
  user.phone = initialAdminUser.phone;
  user.job = initialAdminUser.job;
  user.role = initialAdminUser.role;
  await user.save();
};

const populateDepartments = async () => {
  const userResponse = await loginUserAdmin();
  for (const department of initialDepartments) {
    await apiRequest
      .post('/api/v1/department')
      .set('token', userResponse.token)
      .send({ department_name: department.department_name });
  }
};

const populateUsers = async () => {
  const userResponse = await loginUserAdmin();
  for (const user of initialUsers) {
    await apiRequest
      .post('/api/v1/user')
      .set('token', userResponse.token)
      .send({
        rut: user.rut,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: user.password,
        phone: user.phone,
        job: user.job,
        role: user.role,
        department_id: user.department_id,
      });
  }
};

const populateProjects = async () => {
  const userResponse = await loginUserAdmin();
  for (const project of initialProjects) {
    await apiRequest
      .post('/api/v1/project/')
      .set('token', userResponse.token)
      .send({
        project_name: project.project_name,
        start_date: project.start_date,
        end_date: project.end_date,
        estimated_end_date: project.estimated_end_date,
        project_status: project.project_status,
        department_id: project.department_id,
      });
  }
};

const populateProjectGoal = async () => {
  const userResponse = await loginUserAdmin();
  for (const projectGoal of initialProjectsGoals) {
    await apiRequest
      .post('/api/v1/project-goal/')
      .set('token', userResponse.token)
      .send({
        project_id: projectGoal.project_id,
        goal_name: projectGoal.goal_name,
        goal_value: projectGoal.goal_value,
      });
  }
};

const populateUserProject = async () => {
  const userResponse = await loginUserAdmin();
  for (const userProject of initialUsersProject) {
    await apiRequest
      .post('/api/v1/user_project/')
      .set('token', userResponse.token)
      .send({
        user_id: userProject.user_id,
        project_id: userProject.project_id,
      });
  }
};

export const loginUserAdmin = async () => {
  const loginResponse = await apiRequest.post('/api/v1/user/login').send({
    email: initialAdminUser.email,
    password: initialAdminUser.password,
  });

  return loginResponse.body.data.user;
};

export const loginUserManager = async () => {
  const loginResponse = await apiRequest
    .post('/api/v1/user/login')
    .send({ email: initialUsers[0].email, password: initialUsers[0].password });
  return loginResponse.body.data.user;
};

export const loginUserEmployee = async () => {
  const loginResponse = await apiRequest
    .post('/api/v1/user/login')
    .send({ email: initialUsers[2].email, password: initialUsers[2].password });
  return loginResponse.body.data.user;
};

export const getDepartments = async () => {
  const userResponse = await loginUserAdmin();
  const departmentResponse = await apiRequest
    .get('/api/v1/department/all')
    .set('token', userResponse.token);

  return departmentResponse.body.data.departments;
};

export const getUsers = async () => {
  const userResponse = await loginUserAdmin();
  const usersResponse = await apiRequest
    .get('/api/v1/user/all')
    .set('token', userResponse.token);

  return usersResponse.body.data.users;
};

export const getProjects = async () => {
  const userResponse = await loginUserAdmin();
  const projectResponse = await apiRequest
    .get('/api/v1/project/all')
    .set('token', userResponse.token);
  return projectResponse.body.data.projects;
};

export const getProjectGoals = async () => {
  const userResponse = await loginUserAdmin();
  const projectGoalsResponse = await apiRequest
    .get('/api/v1/project-goal/1')
    .set('token', userResponse.token);
  return projectGoalsResponse.body.data.project_goal;
};

export const getUserProjectByProject = async () => {
  const userResponse = await loginUserAdmin();
  const projectGoalsResponse = await apiRequest
    .get('/api/v1/user_project/project/1')
    .set('token', userResponse.token);
  return projectGoalsResponse.body.data.users;
};

export const setupTestingApp = async () => {
  await AppDataSource.initialize();
  await createInitialUser();
  await populateDepartments();
  await populateUsers();
  await populateProjects();
  await populateUserProject();
  await populateProjectGoal();
};

export const closeConnectionTestingDB = async () => {
  await AppDataSource.destroy();
};
