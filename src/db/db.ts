import { DataSource } from 'typeorm';
import {
  User,
  Project,
  ProjectGoal,
  Department,
  UserProject,
} from '../entities';

const DBOrigin = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env?.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  //synchronize: true, // no usar en produccion
  logging: true,
  entities: [User, Project, ProjectGoal, UserProject, Department],
  ssl: true,
  // subscribers: [],
  // migrations: [],
});

const DBTesting = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  entities: [User, Project, ProjectGoal, UserProject, Department],
  // migrationsRun: true,
  synchronize: true,
});

export const AppDataSource =
  process.env.NODE_ENV !== 'test' ? DBOrigin : DBTesting;
