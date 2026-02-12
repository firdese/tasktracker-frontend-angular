export interface Task {
  taskId?: number;
  taskDescription?: string;
  taskCreatedAtUtc?: string;
  taskUpdatedAtUtc?: string;
  taskCompletedAtUtc?: string | null;
  taskDueAtUtc?: string | null;
  taskDeletedAtUtc?: string | null;
  taskSortOrder?: number;
  taskPriority?: number;
  taskGroupId: number;
}
