import { Task } from './task.types';

export interface TaskGroup {
  taskGroupId?: number;
  taskGroupDescription?: string;
  tasks?: Task[];
}
