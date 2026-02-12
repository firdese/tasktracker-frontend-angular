import { Component, OnInit } from '@angular/core';
import { SingleTaskComponent } from '../single-task/single-task.component';
import { NgFor, NgIf } from '@angular/common';
import { TaskService } from '../task.service';
import { Task } from '../../model/task.types';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { ProjectDashboardService } from '../../app/project-dashboard/project-dashboard.service';
import { TaskGroup } from '../../model/task-group.types';
import { DashboardView } from '../../model/dashboard-view.enum';

interface TimelineGroup {
  key: string;
  label: string;
  tasks: Task[];
}

interface GanttColumn {
  key: string;
  label: string;
}

interface GanttRow {
  task: Task;
  offsetPct: number;
  widthPct: number;
  progressPct: number;
  durationDays: number;
  startLabel: string;
  endLabel: string;
  startMs: number;
  endMs: number;
}

type FocusMode = 'all' | 'overdue' | 'today' | 'week';

@Component({
  selector: 'app-daily-task',
  imports: [
    SingleTaskComponent,
    NgFor,
    NgIf,
    AsyncPipe,
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './daily-task.component.html',
  styleUrl: './daily-task.component.scss',
})
export class DailyTaskComponent implements OnInit {
  private static readonly DAY_MS = 24 * 60 * 60 * 1000;
  dailyTasks: Task[] | undefined = undefined;
  groupTaskId: number = 0;
  isTaskDetailActive: boolean = false;
  activeTaskGroup: TaskGroup | null = null;
  editingProjectDescription: boolean = false;
  projectDescriptionDraft: string = '';
  ganttColumns: GanttColumn[] = [];
  ganttRows: GanttRow[] = [];
  ganttUnscheduledTasks: Task[] = [];
  selectedFocusMode: FocusMode = 'all';
  readonly DashboardView = DashboardView;
  selectedView: DashboardView = DashboardView.List;
  private readonly _viewQueryMap: Record<string, DashboardView> = {
    list: DashboardView.List,
    daily: DashboardView.List,
    timeline: DashboardView.Timeline,
    gantt: DashboardView.Gantt,
  };
  private readonly _focusQueryMap: Record<string, FocusMode> = {
    all: 'all',
    overdue: 'overdue',
    today: 'today',
    week: 'week',
  };
  constructor(
    public _taskService: TaskService,
    private route: ActivatedRoute,
    private _router: Router,
    private _projectDashboardService: ProjectDashboardService,
  ) {}

  ngOnInit(): void {
    this.isTaskDetailActive =
      !!this.route.snapshot.firstChild?.paramMap.get('taskId');

    this.route.paramMap.subscribe((params) => {
      const taskGroupId = params.get('groupTaskId');
      if (taskGroupId) {
        this.groupTaskId = parseInt(taskGroupId);
        this._taskService.loadTaskByTaskGroupId(this.groupTaskId);
        this.refreshActiveTaskGroup();
      }
    });

    this.route.queryParamMap.subscribe((queryParams) => {
      const viewParam = queryParams.get('view')?.toLowerCase();
      const focusParam = queryParams.get('focus')?.toLowerCase();

      const parsedView = viewParam ? this._viewQueryMap[viewParam] : undefined;
      const parsedFocus = focusParam
        ? this._focusQueryMap[focusParam]
        : undefined;

      this.selectedView = parsedView ?? DashboardView.List;
      this.selectedFocusMode = parsedFocus ?? 'all';
    });

    this._taskService.dailyTask$.subscribe((dailyTasks) => {
      this.dailyTasks = dailyTasks;
      this.rebuildGanttChart();
    });

    this._projectDashboardService.taskGroups$.subscribe((taskGroups) => {
      this.refreshActiveTaskGroup(taskGroups);
    });
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  addTask() {
    this._taskService.addTask(this.groupTaskId);
  }

  onTaskDetailActivated() {
    this.isTaskDetailActive = true;
  }

  onTaskDetailDeactivated() {
    this.isTaskDetailActive = false;
  }

  viewSelectionChanged(viewName: DashboardView) {
    this.selectedView = viewName;
    this.syncRouteQuery();
  }

  get sortedDailyTasks(): Task[] {
    return this.getFocusedTasks().sort((leftTask, rightTask) =>
      this.compareTasksForDisplay(leftTask, rightTask),
    );
  }

  get focusModeCounts(): Record<FocusMode, number> {
    const tasks = this.dailyTasks ?? [];
    return {
      all: tasks.length,
      overdue: tasks.filter((task) => this.isTaskOverdue(task)).length,
      today: tasks.filter((task) => this.isTaskDueToday(task)).length,
      week: tasks.filter((task) => this.isTaskDueThisWeek(task)).length,
    };
  }

  setFocusMode(mode: FocusMode) {
    this.selectedFocusMode = mode;
    this.syncRouteQuery();
  }

  get timelineGroups(): TimelineGroup[] {
    const groups = new Map<string, TimelineGroup>();
    const sortedTasks = this.sortedDailyTasks.sort((leftTask, rightTask) => {
      const rightTimestamp = this.getTaskTimelineTimestamp(rightTask);
      const leftTimestamp = this.getTaskTimelineTimestamp(leftTask);
      if (rightTimestamp !== leftTimestamp) {
        return rightTimestamp - leftTimestamp;
      }

      return this.compareTasksForDisplay(leftTask, rightTask);
    });

    for (const task of sortedTasks) {
      const timelineDate = this.getTaskTimelineDate(task);
      const key = timelineDate ? timelineDate.slice(0, 10) : 'unscheduled';
      const label =
        key === 'unscheduled' ? 'No date' : this.formatTimelineKey(key);

      if (!groups.has(key)) {
        groups.set(key, { key, label, tasks: [] });
      }

      groups.get(key)?.tasks.push(task);
    }

    const result = [...groups.values()];
    return result.sort((leftGroup, rightGroup) => {
      if (leftGroup.key === 'unscheduled') {
        return 1;
      }
      if (rightGroup.key === 'unscheduled') {
        return -1;
      }
      if (leftGroup.key === rightGroup.key) {
        return 0;
      }
      return leftGroup.key > rightGroup.key ? -1 : 1;
    });
  }

  getTaskStatusLabel(task: Task): string {
    if (task.taskCompletedAtUtc) {
      return 'Done';
    }

    if (task.taskDueAtUtc) {
      return 'Due';
    }

    return 'Updated';
  }

  getTaskTimelineCaption(task: Task): string {
    const taskDate = this.getTaskTimelineDate(task);
    if (!taskDate) {
      return 'No date';
    }

    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(new Date(taskDate));
  }

  toggleTaskCompletion(task: Task) {
    this._taskService.updateTask(
      {
        ...task,
        taskCompletedAtUtc: task.taskCompletedAtUtc
          ? null
          : new Date().toISOString(),
      },
      'toggle',
    );
  }

  deleteTimelineTask(task: Task) {
    this._taskService.deleteTask(task);
  }

  startProjectDescriptionEdit() {
    this.editingProjectDescription = true;
    this.projectDescriptionDraft =
      this.activeTaskGroup?.taskGroupDescription ?? '';
  }

  cancelProjectDescriptionEdit(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.editingProjectDescription = false;
    this.projectDescriptionDraft =
      this.activeTaskGroup?.taskGroupDescription ?? '';
  }

  saveProjectDescription(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    const trimmedDescription = this.projectDescriptionDraft.trim();
    if (!this.activeTaskGroup?.taskGroupId || !trimmedDescription) {
      this.cancelProjectDescriptionEdit(event);
      return;
    }

    if (trimmedDescription === this.activeTaskGroup.taskGroupDescription) {
      this.cancelProjectDescriptionEdit(event);
      return;
    }

    this._projectDashboardService.updateTaskGroup({
      ...this.activeTaskGroup,
      taskGroupDescription: trimmedDescription,
    });

    this.editingProjectDescription = false;
  }

  private refreshActiveTaskGroup(taskGroups?: TaskGroup[] | null) {
    const groups = taskGroups ?? this._projectDashboardService.taskGroups.value;
    this.activeTaskGroup =
      groups?.find((group) => group.taskGroupId === this.groupTaskId) ?? null;
    if (!this.editingProjectDescription) {
      this.projectDescriptionDraft =
        this.activeTaskGroup?.taskGroupDescription ?? '';
    }
  }

  private getTaskTimelineTimestamp(task: Task): number {
    const timelineDate = this.getTaskTimelineDate(task);
    if (!timelineDate) {
      return 0;
    }

    return new Date(timelineDate).getTime();
  }

  private getTaskTimelineDate(task: Task): string | null {
    const taskDate =
      task.taskStartAtUtc ??
      task.taskEndAtUtc ??
      task.taskDueAtUtc ??
      task.taskCompletedAtUtc ??
      task.taskUpdatedAtUtc ??
      task.taskCreatedAtUtc ??
      null;

    if (!taskDate) {
      return null;
    }

    const parsedDate = new Date(taskDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate.toISOString();
  }

  private formatTimelineKey(key: string): string {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(`${key}T00:00:00.000Z`));
  }

  private rebuildGanttChart() {
    const rows: GanttRow[] = [];
    const unscheduledTasks: Task[] = [];
    for (const task of this.sortedDailyTasks) {
      const taskStart = this.parseTaskDate(task.taskStartAtUtc);
      const taskEnd = this.parseTaskDate(task.taskEndAtUtc);

      if (!taskStart || !taskEnd) {
        unscheduledTasks.push(task);
        continue;
      }

      const startMs = this.startOfDay(taskStart).getTime();
      const endMs = this.startOfDay(taskEnd).getTime();
      const normalizedEndMs = endMs < startMs ? startMs : endMs;
      const durationDays =
        Math.floor((normalizedEndMs - startMs) / DailyTaskComponent.DAY_MS) + 1;

      rows.push({
        task,
        startMs,
        endMs: normalizedEndMs,
        durationDays,
        offsetPct: 0,
        widthPct: 0,
        progressPct: this.getTaskProgress(task),
        startLabel: this.formatGanttDateLabel(startMs),
        endLabel: this.formatGanttDateLabel(normalizedEndMs),
      });
    }

    rows.sort((leftRow, rightRow) => {
      if (leftRow.startMs !== rightRow.startMs) {
        return leftRow.startMs - rightRow.startMs;
      }

      return this.compareTasksForDisplay(leftRow.task, rightRow.task);
    });
    this.ganttUnscheduledTasks = unscheduledTasks;

    if (!rows.length) {
      this.ganttRows = [];
      this.ganttColumns = [];
      return;
    }

    let rangeStartMs = Math.min(...rows.map((row) => row.startMs));
    let rangeEndMs = Math.max(...rows.map((row) => row.endMs));
    const spanDays =
      Math.floor((rangeEndMs - rangeStartMs) / DailyTaskComponent.DAY_MS) + 1;
    const minimumSpanDays = 7;
    if (spanDays < minimumSpanDays) {
      rangeEndMs =
        rangeStartMs + (minimumSpanDays - 1) * DailyTaskComponent.DAY_MS;
    }

    const totalSpanMs = rangeEndMs - rangeStartMs + DailyTaskComponent.DAY_MS;
    this.ganttRows = rows.map((row) => {
      const offsetPct = ((row.startMs - rangeStartMs) / totalSpanMs) * 100;
      const widthPct = Math.max(
        ((row.endMs - row.startMs + DailyTaskComponent.DAY_MS) / totalSpanMs) *
          100,
        1.5,
      );
      return {
        ...row,
        offsetPct,
        widthPct,
      };
    });

    this.ganttColumns = [];
    const columnCount =
      Math.floor((rangeEndMs - rangeStartMs) / DailyTaskComponent.DAY_MS) + 1;
    for (let index = 0; index < columnCount; index++) {
      const dayMs = rangeStartMs + index * DailyTaskComponent.DAY_MS;
      const key = new Date(dayMs).toISOString().slice(0, 10);
      this.ganttColumns.push({
        key,
        label: new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
        }).format(new Date(dayMs)),
      });
    }
  }

  private getTaskProgress(task: Task): number {
    if (
      typeof task.taskProgress === 'number' &&
      Number.isFinite(task.taskProgress)
    ) {
      return Math.min(100, Math.max(0, task.taskProgress));
    }

    return task.taskCompletedAtUtc ? 100 : 0;
  }

  private parseTaskDate(value?: string | null): Date | null {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private formatGanttDateLabel(dayMs: number): string {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dayMs));
  }

  private compareTasksForDisplay(leftTask: Task, rightTask: Task): number {
    const sortOrderComparison = this.compareNullableNumbers(
      leftTask.taskSortOrder,
      rightTask.taskSortOrder,
    );
    if (sortOrderComparison !== 0) {
      return sortOrderComparison;
    }

    const priorityComparison = this.compareNullableNumbers(
      leftTask.taskPriority,
      rightTask.taskPriority,
    );
    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    const leftStart =
      this.parseTaskDate(leftTask.taskStartAtUtc)?.getTime() ??
      Number.MAX_SAFE_INTEGER;
    const rightStart =
      this.parseTaskDate(rightTask.taskStartAtUtc)?.getTime() ??
      Number.MAX_SAFE_INTEGER;
    if (leftStart !== rightStart) {
      return leftStart - rightStart;
    }

    return (
      (leftTask.taskId ?? Number.MAX_SAFE_INTEGER) -
      (rightTask.taskId ?? Number.MAX_SAFE_INTEGER)
    );
  }

  private compareNullableNumbers(
    leftValue: number | null | undefined,
    rightValue: number | null | undefined,
  ): number {
    const leftIsDefined = leftValue !== null && leftValue !== undefined;
    const rightIsDefined = rightValue !== null && rightValue !== undefined;
    if (!leftIsDefined && !rightIsDefined) {
      return 0;
    }
    if (!leftIsDefined) {
      return 1;
    }
    if (!rightIsDefined) {
      return -1;
    }

    return leftValue - rightValue;
  }

  private getFocusedTasks(): Task[] {
    const tasks = [...(this.dailyTasks ?? [])];
    if (this.selectedFocusMode === 'all') {
      return tasks;
    }

    if (this.selectedFocusMode === 'overdue') {
      return tasks.filter((task) => this.isTaskOverdue(task));
    }

    if (this.selectedFocusMode === 'today') {
      return tasks.filter((task) => this.isTaskDueToday(task));
    }

    return tasks.filter((task) => this.isTaskDueThisWeek(task));
  }

  private isTaskOverdue(task: Task): boolean {
    if (task.taskCompletedAtUtc) {
      return false;
    }
    const dueDate = this.parseTaskDate(task.taskDueAtUtc);
    if (!dueDate) {
      return false;
    }

    const today = this.startOfDay(new Date()).getTime();
    return this.startOfDay(dueDate).getTime() < today;
  }

  private isTaskDueToday(task: Task): boolean {
    const dueDate = this.parseTaskDate(task.taskDueAtUtc);
    if (!dueDate) {
      return false;
    }

    const today = this.startOfDay(new Date()).getTime();
    return this.startOfDay(dueDate).getTime() === today;
  }

  private isTaskDueThisWeek(task: Task): boolean {
    const dueDate = this.parseTaskDate(task.taskDueAtUtc);
    if (!dueDate) {
      return false;
    }

    const dueMs = this.startOfDay(dueDate).getTime();
    const startOfToday = this.startOfDay(new Date()).getTime();
    const endOfWindow = startOfToday + DailyTaskComponent.DAY_MS * 6;
    return dueMs >= startOfToday && dueMs <= endOfWindow;
  }

  private syncRouteQuery() {
    if (!this.groupTaskId) {
      return;
    }

    this._router.navigate(['/', this.groupTaskId], {
      queryParams: {
        view: this.selectedView.toLowerCase(),
        focus: this.selectedFocusMode,
      },
    });
  }
}
