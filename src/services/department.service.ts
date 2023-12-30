import { Department } from "../entities";
import { BadRequestError, NotFoundError } from "../responses/customApiError";
import {
  DEPARTMENT_NOT_FOUND,
  INVALID_DEPARTMENT,
  INVALID_DEPARTMENT_ID,
} from "../responses/apiMessages";
import { isString, validateParamIsNumber } from "../utils/validation";

export const findAllDepartments = async (): Promise<Department[]> => {
  const departments = await Department.find();

  return departments;
};

export const saveNewDepartment = async (name: string): Promise<Department> => {
  if (!isString(name)) {
    throw new BadRequestError(INVALID_DEPARTMENT);
  }

  const department = new Department();
  department.department_name = name;

  return await department.save();
};

export const updateDepartmentById = async (
  departmentId: string,
  name: string
): Promise<Department> => {
  if (!validateParamIsNumber(departmentId)) {
    throw new BadRequestError(INVALID_DEPARTMENT_ID);
  }

  if (!isString(name)) {
    throw new BadRequestError(INVALID_DEPARTMENT);
  }

  const department = await Department.findOneBy({ id: Number(departmentId) });

  if (!department) throw new NotFoundError(DEPARTMENT_NOT_FOUND);

  const updated_department = await Department.save({
    id: Number(departmentId),
    department_name: name,
  });

  return updated_department;
};

export const deleteDepartmentById = async (departmentId: string): Promise<void> => {
  if (!validateParamIsNumber(departmentId)) {
    throw new BadRequestError(INVALID_DEPARTMENT_ID);
  }

  const department = await Department.findOneBy({ id: Number(departmentId) });

  if (!department) throw new NotFoundError(DEPARTMENT_NOT_FOUND);

  await Department.delete({ id: Number(departmentId) });
};
