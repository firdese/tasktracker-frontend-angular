import { Task } from './task.types';

export interface TaskGroup {
  taskGroupId?: number;
  taskGroupDescription?: string;
  taskGroupCreatedAtUtc?: string;
  taskGroupUpdatedAtUtc?: string;
  taskGroupArchivedAtUtc?: string | null;
  taskGroupColor?: string | null;
  taskGroupSortOrder?: number;
  tasks?: Task[];
}
