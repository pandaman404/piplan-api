import { Request } from 'express';
import { User } from './entities';

export interface customRequest extends Request {
  user: User;
}

export enum Availability {
  AVAILABLE = 'available',
  ON_VACATION = 'on vacation',
  NOT_AVAILABLE = 'not available',
}

export enum Role {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  ADMIN = 'admin',
  BIG_BOSS = 'big boss',
}

export enum ProjectStatus {
  CANCELED = 'canceled',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in progress',
  POSTPONED = 'postponed',
}

export enum DateType {
  START_DATE = 'start_date',
  ESTIMATED_END_DATE = 'estimated_end_date',
  END_DATE = 'end_date',
}

export interface NewUser {
  rut: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  job: string;
  role: Role;
  start_date?: Date;
  url_avatar?: string;
  vacation_date?: number;
  department_id?: number;
}

export interface UserFilters {
  email?: string;
}

export interface UpdateUserInfo {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  url_avatar?: string;
}

export interface ProjectType {
  id: number;
  project_name: string;
  start_date: Date;
  end_date: Date;
  estimated_end_date: Date;
  created_at: Date;
  updated_at: Date;
  project_status: ProjectStatus;
  // userId: number;
  is_visible: boolean;
}

export interface NewProject {
  project_name: string;
  start_date: Date;
  end_date: Date | null;
  estimated_end_date: Date | null;
  project_status: ProjectStatus;
  userId: Number;
  department_id: Number;
}

export interface FiltersProject {
  start: Date | null;
  end: Date | null;
  status: ProjectStatus | null;
  date_type: DateType | null;
  department: string | null;
}

export interface UpdateProject {
  project_name: string | null;
  end_date: Date | null;
  estimated_end_date: Date | null;
  project_status: ProjectStatus | null;
}

export interface NewProjectGoal {
  project_id: Number;
  goal_name: string;
  goal_value: Number;
}

export interface UpdateProjectGoal {
  goal_name: string | null;
  goal_value: Number | null;
  is_completed: boolean | null;
}
export interface NewUserProject {
  user_id: number | number[];
  project_id: number;
}
