import {
  ADD_USER_TO_PROJECT,
  INVALID_ID,
  MISSING_FIELDS,
  NO_TOKEN_PROVIDED,
  PROJECT_NOT_FOUND,
  REGISTER_NOT_FOUND,
  REMOVE_USER_FROM_PROJECT,
  USERS_NOT_FOUND_IN_PROJECT,
  USER_NOT_FOUND,
  USER_REGISTERED_IN_PROJECT,
  USER_UNAUTHORIZED,
} from '../responses/apiMessages';
import {
  apiRequest,
  loginUserAdmin,
  setupTestingApp,
  closeConnectionTestingDB,
  getProjects,
  loginUserEmployee,
  getUsers,
} from './helpers';

let token = '';

afterEach(async () => {
  await closeConnectionTestingDB();
});

beforeEach(async () => {
  await setupTestingApp();
  const response = await loginUserAdmin();
  token = response.token;
});

describe('Get /user_project/project read user project by project', () => {
  test('Should return forbidden if user is not logged', async () => {
    const projects = await getProjects();
    const projectId = projects[0].id;
    const response = await apiRequest
      .get(`/api/v1/user_project/project/${projectId}`)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(NO_TOKEN_PROVIDED);
  });

  test('Should return not found if project id does not exist', async () => {
    const projectId = 999;
    const response = await apiRequest
      .get(`/api/v1/user_project/project/${projectId}`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(PROJECT_NOT_FOUND);
  });

  test('Should return not found if there is not users in this project', async () => {
    const projects = await getProjects();
    const projectId = projects[1].id;
    const response = await apiRequest
      .get(`/api/v1/user_project/project/${projectId}`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(USERS_NOT_FOUND_IN_PROJECT);
  });

  test('Should return unauthorized if user is employee', async () => {
    const tokenEmployee = await loginUserEmployee();
    const projects = await getProjects();
    const projectId = projects[0].id;
    const response = await apiRequest
      .get(`/api/v1/user_project/project/${projectId}`)
      .set('token', tokenEmployee.token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(USER_UNAUTHORIZED);
  });

  test('Should return ok if credentials and project id are valid', async () => {
    const projects = await getProjects();
    const projectId = projects[0].id;
    const userProject = await apiRequest
      .get(`/api/v1/user_project/project/${projectId}`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(userProject.statusCode).toBe(200);
    expect(userProject.body).toHaveProperty('success', true);
    expect(userProject.body.data).toHaveProperty('users');
    for (const singleUserProject of userProject.body.data.users) {
      expect(singleUserProject).toHaveProperty('user');
    }
  });
});

describe('Get /user_project/user read user project by user', () => {
  test('Should return forbidden if user is not logged', async () => {
    const users = await getUsers();
    const userId = users[2].id;
    const response = await apiRequest
      .get(`/api/v1/user_project/user/${userId}`)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(NO_TOKEN_PROVIDED);
  });

  test('Should return not found if user id does not exist', async () => {
    const userId = 999;
    const response = await apiRequest
      .get(`/api/v1/user_project/user/${userId}`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(USER_NOT_FOUND);
  });

  test('Should return not found if there is not users in this project', async () => {
    const users = await getUsers();
    const userId = users[1].id;
    const response = await apiRequest
      .get(`/api/v1/user_project/user/${userId}`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(USERS_NOT_FOUND_IN_PROJECT);
  });

  test('Should return unauthorized if user is employee', async () => {
    const tokenEmployee = await loginUserEmployee();
    const users = await getUsers();
    const userId = users[2].id;
    const response = await apiRequest
      .get(`/api/v1/user_project/user/${userId}`)
      .set('token', tokenEmployee.token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(USER_UNAUTHORIZED);
  });

  test('Should return ok if credentials and project id are valid', async () => {
    const users = await getUsers();
    const userId = users[2].id;
    const userProject = await apiRequest
      .get(`/api/v1/user_project/user/${userId}`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(userProject.statusCode).toBe(200);
    expect(userProject.body).toHaveProperty('success', true);
    expect(userProject.body.data).toHaveProperty('projects');
    for (const singleUserProject of userProject.body.data.projects) {
      expect(singleUserProject).toHaveProperty('project');
    }
  });
});

describe('POST /user_project/ add user project', () => {
  test('Should return forbidden if user is not logged', async () => {
    const response = await apiRequest
      .post(`/api/v1/user_project/`)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(NO_TOKEN_PROVIDED);
  });

  test('Should return unauthorized if user is employee', async () => {
    const tokenEmployee = await loginUserEmployee();

    const response = await apiRequest
      .post(`/api/v1/user_project/`)
      .set('token', tokenEmployee.token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(USER_UNAUTHORIZED);
  });

  test('Should return bad request if no data is sent', async () => {
    const response = await apiRequest
      .post(`/api/v1/user_project/`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(MISSING_FIELDS);
  });

  test('Should return badrequest if user doest not exist', async () => {
    const userId = 999;
    const projects = await getProjects();
    const response = await apiRequest
      .post(`/api/v1/user_project/`)
      .set('token', token)
      .send({ user_id: userId, project_id: projects[0].id })
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(USER_NOT_FOUND);
  });

  test('Should return badrequest if the user already exists in this project', async () => {
    const users = await getUsers();
    const projects = await getProjects();
    const response = await apiRequest
      .post(`/api/v1/user_project/`)
      .set('token', token)
      .send({ user_id: users[2].id, project_id: projects[0].id })
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(USER_REGISTERED_IN_PROJECT);
  });

  test('Should return Bad request if user_id or project_id type does not valid', async () => {
    const response = await apiRequest
      .post(`/api/v1/user_project/`)
      .set('token', token)
      .send({ user_id: true, project_id: true })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(MISSING_FIELDS);
  });
  test('Should return Ok if user was added to project', async () => {
    const users = await getUsers();
    const projects = await getProjects();
    const response = await apiRequest
      .post(`/api/v1/user_project/`)
      .set('token', token)
      .send({ user_id: users[2].id, project_id: projects[1].id })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.message).toBe(ADD_USER_TO_PROJECT);
  });
});

describe('DELETE /user_project/:id add user project', () => {
  test('Should return forbidden if user is not logged', async () => {
    const response = await apiRequest
      .delete(`/api/v1/user_project/1`)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(NO_TOKEN_PROVIDED);
  });

  test('Should return unauthorized if user is employee', async () => {
    const tokenEmployee = await loginUserEmployee();
    const response = await apiRequest
      .delete(`/api/v1/user_project/1`)
      .set('token', tokenEmployee.token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(USER_UNAUTHORIZED);
  });

  test('Should return not found if id does not exist', async () => {
    const id = 999;
    const response = await apiRequest
      .delete(`/api/v1/user_project/${id}`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(REGISTER_NOT_FOUND);
  });

  test('Should return not found if id type is not valid', async () => {
    const id = true;
    const response = await apiRequest
      .delete(`/api/v1/user_project/${id}`)
      .set('token', token)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(INVALID_ID);
  });

  test('Should return ok if user was removed from project', async () => {
    const id = 2;
    const response = await apiRequest
      .delete(`/api/v1/user_project/${id}`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.message).toBe(REMOVE_USER_FROM_PROJECT);
  });
});
