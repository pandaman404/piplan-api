import {
  // DEPARTMENT_DELETED,
  DEPARTMENT_UPDATED,
} from '../responses/apiMessages';
import {
  apiRequest,
  setupTestingApp,
  closeConnectionTestingDB,
  loginUserAdmin,
  loginUserEmployee,
  initialDepartments,
} from './helpers';

let tokenAdmin = '';
let tokenEmployee = '';
let departmentId = 0;

beforeEach(async () => {
  await setupTestingApp();
});

afterEach(async () => {
  await closeConnectionTestingDB();
});

describe('GET /department/all', () => {
  test('Should return 403 if user is not logged', async () => {
    await apiRequest
      .get('/api/v1/department/all')
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return an array of departments', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const response = await apiRequest
      .get('/api/v1/department/all')
      .set({ token: tokenAdmin });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('departments');
    expect(response.body.data.departments).toBeInstanceOf(Array);
    expect(response.body.data.departments).toHaveLength(
      initialDepartments.length
    );
  });
});

describe('POST /department', () => {
  test('Should return 403 if user is not logged', async () => {
    await apiRequest
      .post('/api/v1/department')
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return 401 if user is unauthorized', async () => {
    const employeeAuthenticated = await loginUserEmployee();
    tokenEmployee = employeeAuthenticated.token;

    const response = await apiRequest
      .post('/api/v1/department')
      .set({ token: tokenEmployee })
      .send({ department_name: 'test' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 400 if department name is invalid', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const response = await apiRequest
      .post('/api/v1/department')
      .set({ token: tokenAdmin })
      .send({ department_name: '' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 200 and create a new department.', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const response = await apiRequest
      .post('/api/v1/department')
      .set({ token: tokenAdmin })
      .send({ department_name: 'test' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('department');
    expect(response.body.data.department).toHaveProperty('id');
    expect(response.body.data.department).toHaveProperty(
      'department_name',
      'test'
    );
  });
});

describe('PUT /department/:id', () => {
  test('Should return 403 if user is not logged', async () => {
    departmentId = 1;

    await apiRequest
      .put(`/api/v1/department/${departmentId}`)
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return 401 if user is unauthorized', async () => {
    const employeeAuthenticated = await loginUserEmployee();
    tokenEmployee = employeeAuthenticated.token;
    departmentId = 1;

    const response = await apiRequest
      .put(`/api/v1/department/${departmentId}`)
      .set({ token: tokenEmployee })
      .send({ department_name: 'test' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 404 if department not exists', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    departmentId = 999;

    const response = await apiRequest
      .put(`/api/v1/department/${departmentId}`)
      .set({ token: tokenAdmin })
      .send({ department_name: 'test' });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 400 if department name is invalid', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const response = await apiRequest
      .put(`/api/v1/department/${departmentId}`)
      .set({ token: tokenAdmin })
      .send({ department_name: '' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 200 and update the department with id 1', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    departmentId = 1;

    const response = await apiRequest
      .put(`/api/v1/department/${departmentId}`)
      .set({ token: tokenAdmin })
      .send({ department_name: 'updated_test' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', DEPARTMENT_UPDATED);
    expect(response.body.data).toHaveProperty('department');
    expect(response.body.data.department).toHaveProperty('id');
    expect(response.body.data.department).toHaveProperty(
      'department_name',
      'updated_test'
    );
  });
});

describe('DELETE /department/:id', () => {
  test('Should return 403 if user is not logged', async () => {
    departmentId = 1;

    await apiRequest
      .delete(`/api/v1/department/${departmentId}`)
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return 401 if user is unauthorized', async () => {
    const employeeAuthenticated = await loginUserEmployee();
    tokenEmployee = employeeAuthenticated.token;
    departmentId = 1;

    const response = await apiRequest
      .delete(`/api/v1/department/${departmentId}`)
      .set({ token: tokenEmployee });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 409 if the department contains associated users or projects', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    departmentId = 1;

    const response = await apiRequest
      .delete(`/api/v1/department/${departmentId}`)
      .set({ token: tokenAdmin });

    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return 404 if department not found', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    departmentId = 999;

    const response = await apiRequest
      .delete(`/api/v1/department/${departmentId}`)
      .set({ token: tokenAdmin });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should delete department if not associated with any user or project', async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    departmentId = 3;

    const response = await apiRequest
      .delete(`/api/v1/department/${departmentId}`)
      .set({ token: tokenAdmin });

    console.log(response);

    // expect(response.statusCode).toBe(200);
    // expect(response.body).toHaveProperty("success", true);
    // expect(response.body).toHaveProperty("message", DEPARTMENT_DELETED);
  });
});
