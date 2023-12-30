import { PROJECT_DELETED, PROJECT_NOT_FOUND, PROJECT_UPDATED } from "../responses/apiMessages";
import {
  apiRequest,
  setupTestingApp,
  closeConnectionTestingDB,
  loginUserAdmin,
  loginUserEmployee,
  initialProjects,
  loginUserManager,
} from "./helpers";

let tokenAdmin = "";
let tokenEmployee = "";
let tokenManager = "";
let projectId: any = 1;
let filters = "";

beforeEach(async () => {
  await setupTestingApp();
});

afterEach(async () => {
  await closeConnectionTestingDB();
});

describe("GET /project/all", () => {
  test("Should return 403 if user is not logged", async () => {
    await apiRequest
      .get("/api/v1/project/all")
      .expect(403)
      .expect("Content-Type", /application\/json/);
  });

  test("should return an array of projects that belong to the same department as the user employee", async () => {
    const employeeAuthenticated = await loginUserEmployee();
    tokenEmployee = employeeAuthenticated.token;

    const response = await apiRequest.get("/api/v1/project/all").set({ token: tokenEmployee });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("projects");
    expect(response.body.data.projects).toBeInstanceOf(Array);
    expect(response.body.data.projects.length).toBeLessThan(initialProjects.length);
  });

  test("Should return an array of all projects if user is authorized", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const response = await apiRequest.get("/api/v1/project/all").set({ token: tokenAdmin });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("projects");
    expect(response.body.data.projects).toBeInstanceOf(Array);
  });
});

describe("GET /project/:id", () => {
  test("Should return 403 if user is not logged", async () => {
    await apiRequest
      .get(`/api/v1/project/${projectId}`)
      .expect(403)
      .expect("Content-Type", /application\/json/);
  });

  test("should return 400 if project id format is incorrect", async () => {
    const employeeAuthenticated = await loginUserEmployee();
    tokenEmployee = employeeAuthenticated.token;
    projectId = true;

    const response = await apiRequest
      .get(`/api/v1/project/${projectId}`)
      .set({ token: tokenEmployee });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  test("should return 404 if project not found", async () => {
    const employeeAuthenticated = await loginUserEmployee();
    tokenEmployee = employeeAuthenticated.token;
    projectId = 999;

    const response = await apiRequest
      .get(`/api/v1/project/${projectId}`)
      .set({ token: tokenEmployee });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("success", false);
  });

  test("Should return 401 if user is unauthorized to access this project", async () => {
    const employeeAuthenticated = await loginUserEmployee();
    tokenEmployee = employeeAuthenticated.token;
    projectId = 1;

    const response = await apiRequest
      .get(`/api/v1/project/${projectId}`)
      .set({ token: tokenEmployee });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  test("Should return 200 and project by id", async () => {
    const employeeAuthenticated = await loginUserEmployee();
    tokenEmployee = employeeAuthenticated.token;
    projectId = 3;

    const response = await apiRequest
      .get(`/api/v1/project/${projectId}`)
      .set({ token: tokenEmployee });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("project");
  });
});

describe("GET /project/filters", () => {
  test("Should return 403 if user is not logged", async () => {
    await apiRequest
      .get("/api/v1/project/filters")
      .query(filters)
      .expect(403)
      .expect("Content-Type", /application\/json/);
  });

  test("Should return 400 if one or more filters are invalid", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    filters = "status=potato&department=999";

    const response = await apiRequest
      .get("/api/v1/project/filters/")
      .query(filters)
      .set({ token: tokenAdmin });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  test("Should return all projects if no filter was applied", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    filters = "";

    const response = await apiRequest
      .get("/api/v1/project/filters/")
      .query(filters)
      .set({ token: tokenAdmin });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("projects");
    expect(response.body.data.projects).toBeInstanceOf(Array);
    expect(response.body.data.projects.length).toBe(initialProjects.length);
  });

  test("Should return all projects with status completed", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    filters = "status=completed";

    const response = await apiRequest
      .get("/api/v1/project/filters/")
      .query(filters)
      .set({ token: tokenAdmin });

    const completedProjects = initialProjects.filter(
      (project) => project.project_status === "completed"
    ).length;

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("projects");
    expect(response.body.data.projects).toBeInstanceOf(Array);
    expect(response.body.data.projects.length).toBe(completedProjects);
  });

  test("Should return all projects that belong to a valid department", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    filters = "department=2";

    const response = await apiRequest
      .get("/api/v1/project/filters/")
      .query(filters)
      .set({ token: tokenAdmin });

    const projectsFromDepartment2 = initialProjects.filter(
      (project) => project.department_id === 2
    ).length;

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("projects");
    expect(response.body.data.projects).toBeInstanceOf(Array);
    expect(response.body.data.projects.length).toBe(projectsFromDepartment2);
  });

  test("Should return all projects that are within a valid date range", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    const start = "2023-07-01";
    const end = "2023-07-30";
    filters = "date_type=start_date&start=2023-07-01&end=2023-07-30";

    const response = await apiRequest
      .get("/api/v1/project/filters/")
      .query(filters)
      .set({ token: tokenAdmin });

    const dateStart = new Date(start);
    const dateEnd = new Date(end);

    const projectsFiltered = initialProjects.filter((project) => {
      const projectStart = new Date(project.start_date);
      return projectStart >= dateStart && projectStart <= dateEnd;
    }).length;

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("projects");
    expect(response.body.data.projects).toBeInstanceOf(Array);
    expect(response.body.data.projects.length).toBe(projectsFiltered);
  });
});

describe("POST /project", () => {
  test("Should return 403 if user is not logged", async () => {
    await apiRequest
      .post("/api/v1/project")
      .expect(403)
      .expect("Content-Type", /application\/json/);
  });

  test("Should return 400 if one or more required fields are missing or invalid", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const newProject = {
      end_date: "2023-07-30",
      estimated_end_date: "2024-01-01",
      project_status: "potato",
      department_id: 1,
    };

    const response = await apiRequest
      .post("/api/v1/project")
      .set({ token: tokenAdmin })
      .send(newProject);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  test("Should return 404 if project department not exists", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const newProject = {
      project_name: "testing invalid project",
      start_date: "2023-07-27",
      end_date: "2023-07-30",
      estimated_end_date: "2024-01-01",
      project_status: "completed",
      department_id: 99,
    };

    const response = await apiRequest
      .post("/api/v1/project")
      .set({ token: tokenAdmin })
      .send(newProject);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("success", false);
  });

  test("Should return 400 if one or more fields are invalid", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const newProject = {
      project_name: "",
      start_date: "",
      end_date: "",
      estimated_end_date: "",
      project_status: "in progress",
      department_id: 1,
    };

    const response = await apiRequest
      .post("/api/v1/project")
      .set({ token: tokenAdmin })
      .send(newProject);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  test("Should create a new project", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;

    const newProject = {
      project_name: "testing",
      start_date: "2023-07-27",
      end_date: "2023-07-30",
      estimated_end_date: "2024-01-01",
      project_status: "in progress",
      department_id: 1,
    };

    const response = await apiRequest
      .post("/api/v1/project")
      .set({ token: tokenAdmin })
      .send(newProject);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("project");
    expect(response.body.data.project).toHaveProperty("id");
  });
});

describe("PUT /project/:id", () => {
  test("Should return 403 if user is not logged", async () => {
    await apiRequest
      .put(`/api/v1/project/${projectId}`)
      .expect(403)
      .expect("Content-Type", /application\/json/);
  });

  test("Should return 404 if project not found", async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;
    projectId = 999;

    const response = await apiRequest
      .put(`/api/v1/project/${projectId}`)
      .set({ token: tokenManager })
      .send({
        project_name: "project updated",
        project_status: "completed",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body.message).toBe(PROJECT_NOT_FOUND);
  });

  test("Should return 401 if user is unauthorized", async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;
    projectId = 1;

    const response = await apiRequest
      .put(`/api/v1/project/${projectId}`)
      .set({ token: tokenManager })
      .send({
        project_name: "project updated",
        project_status: "completed",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  test("Should return 400 if one or more fields are invalid", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    projectId = 3;

    const response = await apiRequest
      .put(`/api/v1/project/${projectId}`)
      .set({ token: tokenAdmin })
      .send({
        project_name: "",
        project_status: "completed",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  test("Should return 200 and update the project with id 3", async () => {
    const adminAuthenticated = await loginUserAdmin();
    tokenAdmin = adminAuthenticated.token;
    projectId = 3;

    const response = await apiRequest
      .put(`/api/v1/project/${projectId}`)
      .set({ token: tokenAdmin })
      .send({
        project_name: "project updated",
        project_status: "completed",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.message).toBe(PROJECT_UPDATED);
    expect(response.body.data).toHaveProperty("project");
  });
});

describe("PUT /project/delete_project/:id", () => {
  test("Should return 403 if user is not logged", async () => {
    await apiRequest
      .put(`/api/v1/project/delete_project/${projectId}`)
      .expect(403)
      .expect("Content-Type", /application\/json/);
  });

  test("Should return 401 if user is unauthorized", async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;
    projectId = 1;

    const response = await apiRequest
      .put(`/api/v1/project/delete_project/${projectId}`)
      .set({ token: tokenManager });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  test("Should return 404 if project not found", async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;
    projectId = 999;

    const response = await apiRequest
      .put(`/api/v1/project/delete_project/${projectId}`)
      .set({ token: tokenManager });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body.message).toBe(PROJECT_NOT_FOUND);
  });

  test("Should return 200 if project property is_visible has changed correctly", async () => {
    const managerAuthenticated = await loginUserManager();
    tokenManager = managerAuthenticated.token;
    projectId = 3;

    const response = await apiRequest
      .put(`/api/v1/project/delete_project/${projectId}`)
      .set({ token: tokenManager });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", PROJECT_DELETED);
  });
});
