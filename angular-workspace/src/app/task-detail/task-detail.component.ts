import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../task/task.service';
import { Task } from '../../model/task.types';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

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
  constructor(private _taskService: TaskService) {}
  ngOnInit(): void {
    this._taskService.taskDetail$.subscribe((taskDetail) => {
      this.taskDetail = structuredClone(taskDetail);
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
    this._taskService.updateTask(this.taskDetail);
  }
}
