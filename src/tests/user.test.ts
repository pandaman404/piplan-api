import {
  MISSING_FIELDS,
  USER_DELETED,
  USER_UNAUTHORIZED,
  USER_UPDATED,
} from '../responses/apiMessages';

import {
  apiRequest,
  loginUserAdmin,
  getDepartments,
  setupTestingApp,
  closeConnectionTestingDB,
  initialUsers,
  loginUserManager,
  loginUserEmployee,
  initialAdminUser,
} from './helpers';

let token = '';

beforeEach(async () => {
  await setupTestingApp();
  const response = await loginUserAdmin();
  token = response.token;
});

afterEach(async () => {
  await closeConnectionTestingDB();
});

describe('POST /user/login login user', () => {
  test('Should return bad request if no data is sent', async () => {
    await apiRequest
      .post('/api/v1/user/login')
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });
  test('Should return Not found if mail not exists', async () => {
    const response = await apiRequest
      .post('/api/v1/user/login')
      .send({ email: 'novalidmail@gmail.com', password: 'jio' })
      .expect('Content-Type', /application\/json/);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });
  test('Should return Unauthorized if password is no valid', async () => {
    const response = await apiRequest
      .post('/api/v1/user/login')
      .send({ email: initialUsers[0].email, password: 'jio' })
      .expect('Content-Type', /application\/json/);
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });
  test('Should return bad request if email or password were not valid.', async () => {
    const response = await apiRequest
      .post('/api/v1/user/login')
      .send({
        email: '',
        password: '',
      })
      .expect(400)
      .expect('Content-Type', /application\/json/);
    expect(response.body.message).toBe(MISSING_FIELDS);
    expect(response.body).toHaveProperty('success', false);
  });
  test('Should return token if credentials are valid.', async () => {
    const response = await apiRequest.post('/api/v1/user/login').send({
      email: initialUsers[0].email,
      password: initialUsers[0].password,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('user');
  });
});

describe('POST create user', () => {
  test('Should return bad request if no data is sent', async () => {
    await apiRequest
      .post('/api/v1/user')
      .set('token', token)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return unauthorized if user is not admin', async () => {
    const tokenManager = await loginUserManager();
    const departments = await getDepartments();
    const response = await apiRequest
      .post('/api/v1/user')
      .set('token', tokenManager.token)
      .send({
        rut: '20399138-K',
        first_name: 'test',
        last_name: 'test',
        email: 'emailTest@test.cl',
        password: '12345',
        phone: '123456789',
        job: 'QA',
        role: 'admin',
        department_id: departments[0].id,
      })
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return bad request if some field had invalid type.', async () => {
    const departments = await getDepartments();
    const response = await apiRequest
      .post('/api/v1/user')
      .set('token', token)
      .send({
        rut: '20399138-K',
        first_name: '',
        last_name: '',
        email: 'emailTest@test.cl',
        password: '12345',
        phone: '123456789',
        job: 'QA',
        role: 'admin',
        department_id: departments[0].id,
      })
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(MISSING_FIELDS);
  });

  test('Should return ok if credentials and data are valid', async () => {
    const departments = await getDepartments();
    const response = await apiRequest
      .post('/api/v1/user')
      .set('token', token)
      .send({
        rut: '20399138-K',
        first_name: 'test',
        last_name: 'test',
        email: 'emailTest@test.cl',
        password: '12345',
        phone: '123456789',
        job: 'QA',
        role: 'admin',
        department_id: departments[0].id,
      })
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('id');
  });
});

describe('GET /user/all/ read all users', () => {
  test('Should return forbidden if user is not logged', async () => {
    await apiRequest
      .get('/api/v1/user/all')
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return Ok and users data', async () => {
    const totalUsers = [...initialUsers, initialAdminUser];
    const userResponse = await apiRequest
      .get('/api/v1/user/all')
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(userResponse.statusCode).toBe(200);
    expect(userResponse.body.data).toHaveProperty('users');
    expect(userResponse.body.data.users).toHaveLength(totalUsers.length);
  });

  test('if the user is an employee, should return users from the same department as the employee', async () => {
    const employeeToken = await loginUserEmployee();
    const employeeData = await apiRequest
      .get(`/api/v1/user/?email=${initialUsers[2].email}`)
      .set('token', employeeToken.token);
    const userResponse = await apiRequest
      .get('/api/v1/user/all')
      .set('token', employeeToken.token)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    for (const user of userResponse.body.data.users) {
      expect(user.department.id).toBe(
        employeeData.body.data.users.department.id
      );
    }
  });
});

describe('GET /user/ by param', () => {
  test('Should return forbidden if user is not logged', async () => {
    const response = await apiRequest
      .get('/api/v1/user/')
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return bad request if param was not provide', async () => {
    const response = await apiRequest
      .get('/api/v1/user/')
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return ok and user data', async () => {
    const response = await apiRequest
      .get(`/api/v1/user/?email=${initialUsers[0].email}`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('users');
  });

  test("Should return users 'null' if email does not exist", async () => {
    const response = await apiRequest
      .get(`/api/v1/user/?email=dontvalidemail@gmail.com`)
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data.users).toBe(null);
  });
});

describe('PUT /user/:id  PUT user data', () => {
  test('Should return forbidden if user is not logged', async () => {
    await apiRequest
      .put('/api/v1/user/1')
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });
  test('Should return Bad request not data is sent', async () => {
    const response = await apiRequest
      .put('/api/v1/user/1')
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return Not found if user does not exist', async () => {
    const response = await apiRequest
      .put('/api/v1/user/50')
      .set('token', token)
      .send({ first_name: 'empleado', last_name: 'test' })
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return Unauthorized if user is employee and try to edit another user', async () => {
    const employeeData = await loginUserEmployee();
    const response = await apiRequest
      .put('/api/v1/user/1')
      .set('token', employeeData.token)
      .send({ first_name: 'empleado', last_name: 'test' })
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
  });

  test('should return bad request if some values had invalid type.', async () => {
    const response = await apiRequest
      .put('/api/v1/user/1')
      .set('token', token)
      .send({ first_name: '', last_name: '' })
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(MISSING_FIELDS);
  });

  test('should return Ok, user data updated and message', async () => {
    const response = await apiRequest
      .put('/api/v1/user/1')
      .set('token', token)
      .send({ first_name: 'empleado', last_name: 'test' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.message).toBe(USER_UPDATED);
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('id');
  });
});

describe('PUT /user/deactivate_account/:id Deactivate account', () => {
  test('Should return forbidden if user is not logged', async () => {
    await apiRequest
      .put('/api/v1/user/deactivate_account/1')
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  test('Should return Not found if user does not exist', async () => {
    const response = await apiRequest
      .put('/api/v1/user/deactivate_account/50')
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });

  test('Should return Unauthorized if manager try to delete user', async () => {
    const managerResponse = await loginUserManager();
    const response = await apiRequest
      .put('/api/v1/user/deactivate_account/1')
      .set('token', managerResponse.token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toBe(USER_UNAUTHORIZED);
  });

  test('Should return ok and message', async () => {
    const response = await apiRequest
      .put('/api/v1/user/deactivate_account/1')
      .set('token', token)
      .expect('Content-Type', /application\/json/);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.message).toBe(USER_DELETED);
  });
});
