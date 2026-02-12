import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TaskService } from '../../task/task.service';
import { Task } from '../../model/task.types';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

type NullableTaskDateKey =
  | 'taskStartAtUtc'
  | 'taskEndAtUtc'
  | 'taskCompletedAtUtc'
  | 'taskDueAtUtc'
  | 'taskDeletedAtUtc';
type EditableTaskDateKey = NullableTaskDateKey;

@Component({
  selector: 'app-task-detail',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule,
    CommonModule,
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnInit {
  taskDetail: Task | undefined;
  dependencyTaskIdsInput: string = '';
  readonly priorityOptions: Array<{ value: number; label: string }> = [
    { value: 1, label: 'P1 - Critical' },
    { value: 2, label: 'P2 - High' },
    { value: 3, label: 'P3 - Medium' },
    { value: 4, label: 'P4 - Low' },
    { value: 5, label: 'P5 - Backlog' },
  ];
  dateInputValues: Record<EditableTaskDateKey, Date | null> = {
    taskStartAtUtc: null,
    taskEndAtUtc: null,
    taskDueAtUtc: null,
    taskCompletedAtUtc: null,
    taskDeletedAtUtc: null,
  };

  constructor(
    private _taskService: TaskService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe((params) => {
      const taskId = params.get('taskId');
      if (taskId) {
        const parsedTaskId = Number.parseInt(taskId, 10);
        if (!Number.isNaN(parsedTaskId)) {
          this._taskService.loadTaskDetailByTaskId(parsedTaskId);
          return;
        }
      }

      this._taskService.updateTaskDetail(undefined);
    });
    this._taskService.taskDetail$.subscribe((taskDetail) => {
      this.taskDetail = structuredClone(taskDetail);
      this.dependencyTaskIdsInput = (
        this.taskDetail?.taskDependencyTaskIds ?? []
      ).join(', ');
      this.dateInputValues = {
        taskStartAtUtc: this.toDateObject(this.taskDetail?.taskStartAtUtc),
        taskEndAtUtc: this.toDateObject(this.taskDetail?.taskEndAtUtc),
        taskDueAtUtc: this.toDateObject(this.taskDetail?.taskDueAtUtc),
        taskCompletedAtUtc: this.toDateObject(this.taskDetail?.taskCompletedAtUtc),
        taskDeletedAtUtc: this.toDateObject(this.taskDetail?.taskDeletedAtUtc),
      };
      this._changeDetectorRef.markForCheck();
    });
  }

  onTaskGroupIdChanged(value: unknown) {
    if (!this.taskDetail) {
      return;
    }

    const parsedNumber = this.toNullableNumber(value);
    if (parsedNumber === undefined) {
      return;
    }

    this.taskDetail.taskGroupId = parsedNumber;
    this._taskService.syncTaskInState(this.taskDetail);
  }

  onOptionalNumberChanged(
    key: 'taskPriority' | 'taskSortOrder' | 'taskProgress',
    value: unknown,
  ) {
    if (!this.taskDetail) {
      return;
    }

    const parsedValue = this.toNullableNumber(value);
    if (key === 'taskProgress') {
      if (parsedValue === undefined) {
        this.taskDetail.taskProgress = null;
        this._taskService.syncTaskInState(this.taskDetail);
        return;
      }

      this.taskDetail.taskProgress = Math.min(100, Math.max(0, parsedValue));
      this._taskService.syncTaskInState(this.taskDetail);
      return;
    }

    this.taskDetail[key] = parsedValue;
    this._taskService.syncTaskInState(this.taskDetail);
  }

  onProgressChanged(value: number) {
    if (!this.taskDetail) {
      return;
    }

    this.taskDetail.taskProgress = Math.min(100, Math.max(0, value));
    this._taskService.syncTaskInState(this.taskDetail);
  }

  onDateChanged(key: EditableTaskDateKey, value: Date | null) {
    if (!this.taskDetail) {
      return;
    }

    const normalizedDate = this.toDateObject(
      value ? value.toISOString() : null,
    );
    this.dateInputValues[key] = normalizedDate;

    const convertedDate = this.toUtcIsoString(normalizedDate);
    this.taskDetail[key] = convertedDate;
    this._taskService.syncTaskInState(this.taskDetail);
  }

  clearNullableDate(key: NullableTaskDateKey) {
    if (!this.taskDetail) {
      return;
    }

    this.dateInputValues[key] = null;
    this.taskDetail[key] = null;
    this._taskService.syncTaskInState(this.taskDetail);
  }

  onSaveDetail() {
    this._taskService.updateTask(this.taskDetail, 'detail');
  }

  backToList() {
    this._router.navigate(['../'], {
      relativeTo: this._activatedRoute,
      queryParamsHandling: 'preserve',
    });
  }

  getPriorityLabel(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return 'None';
    }

    return (
      this.priorityOptions.find((option) => option.value === value)?.label ??
      `P${value}`
    );
  }

  onDependencyIdsChanged(value: string) {
    this.dependencyTaskIdsInput = value;
    if (!this.taskDetail) {
      return;
    }

    this.taskDetail.taskDependencyTaskIds = this.parseDependencyTaskIds(value);
    this._taskService.syncTaskInState(this.taskDetail);
  }

  private toNullableNumber(value: unknown): number | undefined {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const parsedNumber = Number(value);
    if (Number.isNaN(parsedNumber)) {
      return undefined;
    }

    return parsedNumber;
  }

  private toDateObject(utcDate?: string | null): Date | null {
    if (!utcDate) {
      return null;
    }

    const parsedDate = new Date(utcDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  }

  private toUtcIsoString(dateValue: Date | null): string | null {
    if (!dateValue) {
      return null;
    }

    if (Number.isNaN(dateValue.getTime())) {
      return null;
    }

    return dateValue.toISOString();
  }

  private parseDependencyTaskIds(rawValue: string): number[] | null {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
      return null;
    }

    const dependencyIds = trimmedValue
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => !Number.isNaN(value));

    if (!dependencyIds.length) {
      return null;
    }

    return [...new Set(dependencyIds)];
  }
}
