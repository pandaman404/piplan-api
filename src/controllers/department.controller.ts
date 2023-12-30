import { Request, Response } from 'express';
import {
  deleteDepartmentById,
  findAllDepartments,
  saveNewDepartment,
  updateDepartmentById,
} from '../services/department.service';
import PiplanApiResponse from '../responses/piplanApiResponse';
import {
  DEPARTMENT_DELETED,
  DEPARTMENT_UPDATED,
} from '../responses/apiMessages';

export const getAllDepartments = async (_: Request, res: Response) => {
  const departments = await findAllDepartments();
  return PiplanApiResponse.successData(res, {
    nbHits: departments.length,
    departments,
  });
};

export const createDepartment = async (req: Request, res: Response) => {
  const { department_name } = req.body;
  const savedDepartment = await saveNewDepartment(department_name);
  return PiplanApiResponse.successData(res, {
    department: savedDepartment,
  });
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { department_name } = req.body;
  const updated_department = await updateDepartmentById(
    req.params.id,
    department_name
  );

  return PiplanApiResponse.successDataAndMsg(
    res,
    {
      department: updated_department,
    },
    DEPARTMENT_UPDATED
  );
};

export const deleteDepartment = async (req: Request, res: Response) => {
  await deleteDepartmentById(req.params.id);
  return PiplanApiResponse.successMsg(res, DEPARTMENT_DELETED);
};
