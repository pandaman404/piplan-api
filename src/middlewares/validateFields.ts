import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../responses/customApiError';
import {
  INVALID_DEPARTMENT,
  INVALID_EMAIL,
  INVALID_FIRST_NAME,
  INVALID_JOB,
  INVALID_LAST_NAME,
  INVALID_PHONE,
  INVALID_ROLE,
  INVALID_RUT,
  MISSING_FIELDS,
} from '../responses/apiMessages';
import { NewUser, Role, UpdateUserInfo } from '../types';
import {
  isEnum,
  validateRutPattern,
  validateEmailPattern,
  validatePhonePattern,
  isString,
} from '../utils/validation';
import { User, Department } from '../entities';

const validateRut = async (rut: string) => {
  if (!validateRutPattern(rut)) return false;
  const userFound = await User.findOneBy({ rut: rut });
  if (userFound) return false;
  return true;
};

const validateDepartment = async (department_id: number) => {
  const departmentFound = await Department.findOneBy({
    id: Number(department_id),
  });
  if (departmentFound) return true;
  return false;
};

const validateRole = (role: string) => {
  return isEnum(role, Role);
};

const validateNewUserBeforeSave = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    rut,
    first_name,
    last_name,
    email,
    password,
    phone,
    job,
    role,
    department_id,
  }: NewUser = req.body;

  if (
    !rut ||
    !first_name ||
    !last_name ||
    !email ||
    !password ||
    !phone ||
    !job ||
    !role ||
    !department_id
  ) {
    throw new BadRequestError(MISSING_FIELDS);
  }

  if (!isString(first_name)) {
    throw new BadRequestError(INVALID_FIRST_NAME);
  }
  if (!isString(last_name)) {
    throw new BadRequestError(INVALID_LAST_NAME);
  }
  if (!isString(job)) {
    throw new BadRequestError(INVALID_JOB);
  }

  const rutIsValid = await validateRut(rut);

  if (!rutIsValid) {
    throw new BadRequestError(INVALID_RUT);
  }

  if (!validateEmailPattern(email)) {
    throw new BadRequestError(INVALID_EMAIL);
  }

  if (!validatePhonePattern(phone)) {
    throw new BadRequestError(INVALID_PHONE);
  }

  if (!validateRole(role)) {
    throw new BadRequestError(INVALID_ROLE);
  }

  const departmentIsValid = await validateDepartment(department_id);

  if (!departmentIsValid) {
    throw new BadRequestError(INVALID_DEPARTMENT);
  }

  next();
};

const validateUserInfoBeforeUpdate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const { first_name, last_name, email, phone, url_avatar }: UpdateUserInfo =
    req.body;

  if (!first_name && !last_name && !email && !phone && !url_avatar) {
    throw new BadRequestError(MISSING_FIELDS);
  }

  if (first_name && !isString(first_name)) {
    throw new BadRequestError(INVALID_FIRST_NAME);
  }
  if (last_name && !isString(last_name)) {
    throw new BadRequestError(INVALID_LAST_NAME);
  }

  if (email && !validateEmailPattern(email)) {
    throw new BadRequestError(INVALID_EMAIL);
  }

  if (phone && !validatePhonePattern(phone)) {
    throw new BadRequestError(INVALID_PHONE);
  }

  next();
};

export { validateNewUserBeforeSave, validateUserInfoBeforeUpdate };
