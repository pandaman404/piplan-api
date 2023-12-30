import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  BaseEntity,
  BeforeInsert,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Role, Availability } from '../types';
import { Department } from './Department';
import { Project } from './project';
import { UserProject } from './UserProject';

const userAvailability = () => {
  const columnProperties: any = { default: Availability.AVAILABLE };
  if (process.env.NODE_ENV !== 'test') {
    columnProperties.type = 'enum';
    columnProperties.enum = Availability;
  }
  return columnProperties;
};

const userRoleConfig = () => {
  const columnProperties: any = { default: Role.EMPLOYEE };
  if (process.env.NODE_ENV !== 'test') {
    (columnProperties.type = 'enum'), (columnProperties.enum = Role);
  }
  return columnProperties;
};

@Entity({ name: 'pp_user' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  rut: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: '', length: 2048 })
  url_avatar: string;

  @Column({ default: true })
  active: boolean;

  @Column(userAvailability())
  availability: string;

  @Column({ nullable: true })
  job: string;

  @Column(userRoleConfig())
  role: string;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;

  @Column({ default: 0 })
  vacation_days: number;

  @Column({ nullable: true })
  returned_vacation_date: Date;

  @ManyToOne(() => Department, { eager: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Project, (project) => project.user)
  project_created: Project[];

  @OneToMany(() => UserProject, (UserProject) => UserProject.user)
  user_project: UserProject[];

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  static async verifyPassword(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }
}
