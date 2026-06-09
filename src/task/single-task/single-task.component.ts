import { Component, Input, inject } from '@angular/core';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { Task } from '../../model/task.types';
import { TaskService } from '../task.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
@Component({
  selector: 'app-single-task',
  imports: [
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    NgFor,
  ],
  templateUrl: './single-task.component.html',
  styleUrl: './single-task.component.scss',
})
export class SingleTaskComponent {
  private _task: Task | undefined = undefined;
  private _taskService = inject(TaskService);
  descriptionDraft: string = '';
  priorityDraft: number | null = null;
  readonly priorityOptions: Array<{ value: number; label: string }> = [
    { value: 1, label: 'P1 - Critical' },
    { value: 2, label: 'P2 - High' },
    { value: 3, label: 'P3 - Medium' },
    { value: 4, label: 'P4 - Low' },
    { value: 5, label: 'P5 - Backlog' },
  ];

  @Input()
  set task(value: Task | undefined) {
    this._task = value;
    this.descriptionDraft = value?.taskDescription ?? '';
    this.priorityDraft = this.normalizePriority(value?.taskPriority);
  }

  get task(): Task | undefined {
    return this._task;
  }

  updateTaskState(event: MatCheckboxChange) {
    if (!this.task) {
      return;
    }

    this._taskService.updateTask(
      {
        ...this.task,
        taskDescription: this.getNormalizedDescriptionDraft(),
        taskCompletedAtUtc: event.checked ? new Date().toISOString() : null,
      },
      'toggle',
    );
  }

  saveTaskDescription(event?: Event) {
    event?.preventDefault();
    if (!this.task) {
      return;
    }

    const nextDescription = this.getNormalizedDescriptionDraft();
    const currentDescription = this.task.taskDescription ?? '';
    if (nextDescription === currentDescription) {
      this.descriptionDraft = currentDescription;
      return;
    }

    this.descriptionDraft = nextDescription;
    this._taskService.updateTask({
      ...this.task,
      taskDescription: nextDescription,
    });
  }

  resetTaskDescription(event?: Event) {
    event?.preventDefault();
    this.descriptionDraft = this.task?.taskDescription ?? '';
  }

  updateTaskPriority(value: number | null) {
    if (!this.task) {
      return;
    }

    const nextPriority = this.normalizePriority(value);
    this.priorityDraft = nextPriority;
    if (nextPriority === this.normalizePriority(this.task.taskPriority)) {
      return;
    }

    this._taskService.updateTask({
      ...this.task,
      taskDescription: this.getNormalizedDescriptionDraft(),
      taskPriority: nextPriority ?? undefined,
    });
  }

  private getNormalizedDescriptionDraft(): string {
    return this.descriptionDraft.trim();
  }

  private normalizePriority(
    value: number | string | null | undefined,
  ): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsedPriority = Number(value);
    return Number.isNaN(parsedPriority) ? null : parsedPriority;
  }

  deleteTask() {
    this._taskService.deleteTask(this.task);
  }

  taskClicked() {
    this._taskService.updateTaskDetail(this.task);
  }
}
