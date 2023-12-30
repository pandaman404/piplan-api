import { Department, User } from '../entities';

import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from '../responses/customApiError';
import { Role, UpdateUserInfo, UserFilters, NewUser } from '../types';
import jwt from 'jsonwebtoken';
import { validateParamIsNumber } from '../utils/validation';
import {
  INVALID_DEPARTMENT_ID,
  INVALID_PASSWORD,
  USER_NOT_FOUND,
  USER_UNAUTHORIZED,
} from '../responses/apiMessages';

export const findAllUsersByRole = async (
  current_user: User
): Promise<User[]> => {
  let users: User[] = [];

  if (current_user.role === Role.ADMIN) {
    users = await User.find({ where: { active: true } });
  }
  if (
    current_user.role === Role.MANAGER ||
    current_user.role === Role.EMPLOYEE
  ) {
    users = current_user.department
      ? await User.findBy({
          department: { id: current_user.department.id },
          active: true,
        })
      : [];
  }

  return users;
};

export const findUserByFilters = async ({
  email,
}: UserFilters): Promise<User | null> => {
  let user: User | null = null;

  if (email) {
    user = await User.findOneBy({
      email,
      active: true,
    });
  }

  return user;
};

export const saveNewUser = async (new_user: NewUser): Promise<User> => {
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
  } = new_user;

  const user = new User();
  const department = await Department.findOneBy({ id: department_id });

  user.rut = rut;
  user.first_name = first_name;
  user.last_name = last_name;
  user.email = email;
  user.password = password;
  user.phone = phone;
  user.job = job;
  user.role = role;

  if (department) {
    user.department = department;
  }

  return await user.save();
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ token: string | null; user_id: Number; user_email: string }> => {
  const userFound = await User.findOneBy({ email, active: true });

  if (!userFound) throw new NotFoundError(USER_NOT_FOUND);

  const matchPassword = await User.verifyPassword(password, userFound.password);

  if (!matchPassword) throw new UnauthenticatedError(INVALID_PASSWORD);

  const token = process.env.JWT_SECRET
    ? jwt.sign({ id: userFound.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      })
    : null;

  return { token, user_id: userFound.id, user_email: userFound.email };
};

export const updateUserInfoProfile = async (
  currentUser: User,
  userId: string,
  updateUserInfo: UpdateUserInfo
): Promise<User> => {
  const user = await User.findOneBy({ id: Number(userId), active: true });

  if (!user) throw new NotFoundError(USER_NOT_FOUND);

  if (currentUser.role !== Role.ADMIN && currentUser.id !== user.id) {
    throw new UnauthenticatedError(USER_UNAUTHORIZED);
  }

  const { first_name, last_name, email, phone, url_avatar } = updateUserInfo;

  if (first_name) user.first_name = first_name;
  if (last_name) user.last_name = last_name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (url_avatar) user.url_avatar = url_avatar;

  return await user.save();
};

export const deactivateUserAccount = async (userId: string): Promise<void> => {
  if (!validateParamIsNumber(userId)) {
    throw new BadRequestError(INVALID_DEPARTMENT_ID);
  }

  const user = await User.findOneBy({ id: Number(userId), active: true });

  if (!user) throw new NotFoundError(USER_NOT_FOUND);

  await User.update({ id: Number(userId) }, { active: false });
};
