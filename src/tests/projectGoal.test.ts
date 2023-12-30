import {
  INVALID_PROJECT_GOAL_VALUE,
  MISSING_FIELDS,
  PROJECT_GOAL_DELETED,
  PROJECT_GOAL_NOT_FOUND,
  PROJECT_NOT_FOUND,
} from '../responses/apiMessages';
import {
  apiRequest,
  setupTestingApp,
  closeConnectionTestingDB,
  loginUserAdmin,
  loginUserManager,
} from './helpers';

let tokenAdmin = '';
let tokenManager = '';
let projectId = 1;
let projectGoalId = 1;

beforeEach(async () => {
  await setupTestingApp();
});

afterEach(async () => {
  await closeConnectionTestingDB();
});

describe('GET /project-goal/:id', () => {
  test('Should return 403 if user is not logged', async () => {
    await apiRequest
      .get(`/api/v1/project-goal/${projectId}`)
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return 404 if project_id not found', async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;
    projectId = 999;

    const response = await apiRequest
      .get(`/api/v1/project-goal/${projectId}`)
      .set({ token: tokenManager });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return an array of project goals from project_id = 2', async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;
    projectId = 2;

    const response = await apiRequest
      .get(`/api/v1/project-goal/${projectId}`)
      .set({ token: tokenManager });

    const expectedProjectGoals = response.body.data.project_goals.filter(
      (project_goal: any) => project_goal.project.project_id === projectId
    ).length;

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('project_goals');
    expect(response.body.data.project_goals).toBeInstanceOf(Array);
    expect(response.body.data.project_goals.length).toBe(expectedProjectGoals);
  });
});

describe('POST /project-goal', () => {
  test('Should return 403 if user is not logged', async () => {
    await apiRequest
      .post(`/api/v1/project-goal`)
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return 401 user is unauthorized', async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;

    const invalidNewProjectGoal = {
      project_id: 1,
      goal_name: 'invalid goal',
      goal_value: 10,
    };

    const response = await apiRequest
      .post('/api/v1/project-goal')
      .set({ token: tokenManager })
      .send(invalidNewProjectGoal);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 400 if one or more fields are missing', async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;

    const invalidNewProjectGoal = {
      goal_name: 'invalid goal',
    };

    const response = await apiRequest
      .post('/api/v1/project-goal')
      .set({ token: tokenManager })
      .send(invalidNewProjectGoal);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', MISSING_FIELDS);
  });

  test('Should return 404 project_id not found', async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;

    const invalidNewProjectGoal = {
      project_id: 999,
      goal_name: 'invalid goal',
      goal_value: 1,
    };

    const response = await apiRequest
      .post('/api/v1/project-goal')
      .set({ token: tokenManager })
      .send(invalidNewProjectGoal);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', PROJECT_NOT_FOUND);
  });

  test('Should return 400 goal value is invalid', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const invalidNewProjectGoal = {
      project_id: 1,
      goal_name: 'invalid goal',
      goal_value: 99,
    };

    const response = await apiRequest
      .post('/api/v1/project-goal')
      .set({ token: tokenAdmin })
      .send(invalidNewProjectGoal);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', INVALID_PROJECT_GOAL_VALUE);
  });

  test('Should return bad request if goal name string is empty.', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const newProjectGoal = {
      project_id: 1,
      goal_name: '',
      goal_value: 1,
    };

    const response = await apiRequest
      .post('/api/v1/project-goal')
      .set({ token: tokenAdmin })
      .send(newProjectGoal);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(MISSING_FIELDS);
  });

  test('Should return 200 and create a new goal for project with id = 1', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const newProjectGoal = {
      project_id: 1,
      goal_name: 'goal 200',
      goal_value: 1,
    };

    const response = await apiRequest
      .post('/api/v1/project-goal')
      .set({ token: tokenAdmin })
      .send(newProjectGoal);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('project_goal');
    expect(response.body.data.project_goal).toHaveProperty('id');
  });
});

describe('PUT /project-goal/:id', () => {
  test('Should return 403 if user is not logged', async () => {
    await apiRequest
      .put(`/api/v1/project-goal/${projectGoalId}`)
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return 401 user is unauthorized', async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;

    const invalidProjectGoal = {
      project_id: 1,
      goal_name: 'invalid goal',
      goal_value: 10,
    };

    const response = await apiRequest
      .put(`/api/v1/project-goal/${projectGoalId}`)
      .set({ token: tokenManager })
      .send(invalidProjectGoal);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 400 if goal value is invalid', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    projectGoalId = 2;

    const invalidProjectGoal = {
      goal_name: 'test update project goal',
      goal_value: 60,
    };

    const response = await apiRequest
      .put(`/api/v1/project-goal/${projectGoalId}`)
      .set({ token: tokenAdmin })
      .send(invalidProjectGoal);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', INVALID_PROJECT_GOAL_VALUE);
  });

  test('Should return 400 if some field are invalid', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    projectGoalId = 2;

    const invalidProjectGoal = {
      is_completed: 'potato',
    };

    const response = await apiRequest
      .put(`/api/v1/project-goal/${projectGoalId}`)
      .set({ token: tokenAdmin })
      .send(invalidProjectGoal);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 404 if project goal not found', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    projectGoalId = 999;

    const projectGoal = {
      goal_name: 'test update project goal',
      goal_value: 1,
      is_completed: true,
    };

    const response = await apiRequest
      .put(`/api/v1/project-goal/${projectGoalId}`)
      .set({ token: tokenAdmin })
      .send(projectGoal);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', PROJECT_GOAL_NOT_FOUND);
  });

  test('Should return bad request if goal name string is empty.', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    projectGoalId = 2;

    const projectGoal = {
      goal_name: '',
      goal_value: 1,
      is_completed: true,
    };

    const response = await apiRequest
      .put(`/api/v1/project-goal/${projectGoalId}`)
      .set({ token: tokenAdmin })
      .send(projectGoal);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 200 and update project goal', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    projectGoalId = 2;

    const projectGoal = {
      goal_name: 'test update project goal',
      goal_value: 1,
      is_completed: true,
    };

    const response = await apiRequest
      .put(`/api/v1/project-goal/${projectGoalId}`)
      .set({ token: tokenAdmin })
      .send(projectGoal);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('project_goal');
    expect(response.body.data.project_goal).toHaveProperty(
      'goal_name',
      'test update project goal'
    );
    expect(response.body.data.project_goal).toHaveProperty(
      'is_completed',
      true
    );
  });
});

describe('DELETE /project-goal/:id', () => {
  test('Should return 403 if user is not logged', async () => {
    await apiRequest
      .delete(`/api/v1/project-goal/${projectGoalId}`)
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return 401 user is unauthorized', async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;

    const response = await apiRequest
      .delete(`/api/v1/project-goal/${projectGoalId}`)
      .set({ token: tokenManager });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 404 if project goal not found', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    projectGoalId = 999;

    const response = await apiRequest
      .delete(`/api/v1/project-goal/${projectGoalId}`)
      .set({ token: tokenAdmin });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', PROJECT_GOAL_NOT_FOUND);
  });

  test('Should return 200 and delete project goal', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    projectGoalId = 2;

    const response = await apiRequest
      .delete(`/api/v1/project-goal/${projectGoalId}`)
      .set({ token: tokenAdmin });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', PROJECT_GOAL_DELETED);
  });
});
