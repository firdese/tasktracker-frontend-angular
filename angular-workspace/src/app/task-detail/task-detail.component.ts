import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TaskService } from '../../task/task.service';
import { Task } from '../../model/task.types';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from 'express';
import { ActivatedRoute, Route } from '@angular/router';
import { log } from 'console';

@Component({
  selector: 'app-task-detail',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnInit {
  taskDetail: Task | undefined;
  constructor(
    private _taskService: TaskService,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe((params) => {
      const taskId = params.get('taskId');
      if (taskId) {
        this._taskService.loadTaskDetailByTaskId(parseInt(taskId));
      }
    });
    this._taskService.taskDetail$.subscribe((taskDetail) => {
      this.taskDetail = structuredClone(taskDetail);
      this._changeDetectorRef.markForCheck();
    });
  }

  updateTaskDescription(event: Event) {
    if (this.taskDetail) {
      this.taskDetail.taskDescription = (
        event.target as HTMLInputElement
      ).value;
    }
  }

  onSaveDetail() {
    this._taskService.updateTask(this.taskDetail, 'detail');
  }
}
