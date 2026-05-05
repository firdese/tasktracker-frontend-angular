export interface Task {
  taskId?: number;
  taskDescription?: string;
  taskStartAtUtc?: string | null;
  taskEndAtUtc?: string | null;
  taskCompletedAtUtc?: string | null;
  taskDueAtUtc?: string | null;
  taskSortOrder?: number;
  taskPriority?: number;
  taskProgress?: number | null;
  taskDependencyTaskIds?: number[] | null;
  taskGroupId: number;

  // meant for soft delete
  taskDeletedAtUtc?: string | null;

  //audit fields (created, updated)
  taskCreatedAtUtc?: string;
  taskUpdatedAtUtc?: string;
}
