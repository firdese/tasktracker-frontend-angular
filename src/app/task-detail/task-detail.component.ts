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
import { combineLatest } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../storage.service';
import { TaskAttachment } from '../../model/storage.types';

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
  private _currentTaskId: number | null = null;
  dependencyTaskIdsInput: string = '';
  attachments: TaskAttachment[] = [];
  isUploadingAttachment = false;
  readonly localTimeZone: string =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
  readonly metadataDateFormat: string = 'MMM d, y, h:mm:ss a z';
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
    private _storageService: StorageService,
    private _toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe((params) => {
      const taskId = params.get('taskId');
      if (taskId) {
        const parsedTaskId = Number.parseInt(taskId, 10);
        if (!Number.isNaN(parsedTaskId) && parsedTaskId > 0) {
          this._currentTaskId = parsedTaskId;
          this.attachments = [];
          this._taskService.loadTaskDetailByTaskId(parsedTaskId);
          this.loadAttachments(parsedTaskId);
          return;
        }
      }

      this._currentTaskId = null;
      this.attachments = [];
      this._taskService.updateTaskDetail(undefined);
      this.backToList();
    });

    combineLatest([
      this._taskService.taskDetail$,
      this._taskService.dailyTask$,
    ]).subscribe(([taskDetail, dailyTasks]) => {
      if (this._currentTaskId && dailyTasks !== undefined && !taskDetail) {
        this.backToList();
        return;
      }

      this.taskDetail = structuredClone(taskDetail);
      this.dependencyTaskIdsInput = (
        this.taskDetail?.taskDependencyTaskIds ?? []
      ).join(', ');
      this.dateInputValues = {
        taskStartAtUtc: this.toDateObject(this.taskDetail?.taskStartAtUtc),
        taskEndAtUtc: this.toDateObject(this.taskDetail?.taskEndAtUtc),
        taskDueAtUtc: this.toDateObject(this.taskDetail?.taskDueAtUtc),
        taskCompletedAtUtc: this.toDateObject(
          this.taskDetail?.taskCompletedAtUtc,
        ),
        taskDeletedAtUtc: this.toDateObject(this.taskDetail?.taskDeletedAtUtc),
      };
      this._changeDetectorRef.markForCheck();
    });
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

  onAttachmentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file || !this.taskDetail?.taskId || this.isUploadingAttachment) {
      return;
    }

    this.isUploadingAttachment = true;
    this._storageService.uploadTaskAttachment(this.taskDetail.taskId, file).subscribe({
      next: (attachment) => {
        this.attachments = [attachment, ...this.attachments];
        this.isUploadingAttachment = false;
        this._toastrService.success('Attachment uploaded');
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.log(error);
        this.isUploadingAttachment = false;
        this._toastrService.error('Could not upload attachment');
        this._changeDetectorRef.markForCheck();
      },
    });
  }

  openAttachment(attachment: TaskAttachment) {
    this._storageService.download(attachment.objectKey).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, '_blank');
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      },
      error: (error) => {
        console.log(error);
        this._toastrService.error('Could not open attachment');
      },
    });
  }

  deleteAttachment(attachment: TaskAttachment) {
    if (!this.taskDetail?.taskId) {
      return;
    }

    this._storageService
      .deleteTaskAttachment(this.taskDetail.taskId, attachment.taskAttachmentId)
      .subscribe({
      next: () => {
        this.attachments = this.attachments.filter(
          (item) => item.taskAttachmentId !== attachment.taskAttachmentId,
        );
        this._toastrService.success('Attachment deleted');
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.log(error);
        this._toastrService.error('Could not delete attachment');
      },
    });
  }

  formatAttachmentSize(sizeBytes: number): string {
    if (sizeBytes < 1024) {
      return `${sizeBytes} B`;
    }

    if (sizeBytes < 1024 * 1024) {
      return `${(sizeBytes / 1024).toFixed(1)} KB`;
    }

    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
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

  private loadAttachments(taskId: number) {
    this._storageService.listTaskAttachments(taskId).subscribe({
      next: (attachments) => {
        if (this._currentTaskId !== taskId) {
          return;
        }

        this.attachments = attachments;
        this._changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.log(error);
        this.attachments = [];
        this._toastrService.error('Could not load attachments');
        this._changeDetectorRef.markForCheck();
      },
    });
  }
}
