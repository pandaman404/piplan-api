import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { ProjectStatus } from '../types';
import { User } from './User';
import { ProjectGoal } from './projectGoal';
import { Department } from './Department';
import { UserProject } from './UserProject';

const projectStatusConfig = () => {
  const columnProperties: any = { default: ProjectStatus.IN_PROGRESS };
  if (process.env.NODE_ENV !== 'test') {
    columnProperties.type = 'enum';
    columnProperties.enum = ProjectStatus;
  }
  return columnProperties;
};

@Entity({ name: 'pp_project' })
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project_name: string;

  @Column()
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;

  @Column({ nullable: true })
  estimated_end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column(projectStatusConfig())
  project_status: string;

  @Column({ default: true })
  is_visible: boolean;

  @ManyToOne(() => User, (user) => user.project_created, { eager: true })
  @JoinColumn({ name: 'creator_user_id' })
  user: User;

  @OneToMany(() => ProjectGoal, (projectGoal) => projectGoal.project)
  goals: ProjectGoal[];

  @OneToMany(() => UserProject, (UserProject) => UserProject.project)
  user_project: UserProject[];

  @ManyToOne(() => Department, { eager: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
