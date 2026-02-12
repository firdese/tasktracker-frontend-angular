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
@Component({
  selector: 'app-single-task',
  imports: [MatCheckboxModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './single-task.component.html',
  styleUrl: './single-task.component.scss',
})
export class SingleTaskComponent {
  @Input() task: Task | undefined = undefined;
  private _taskService = inject(TaskService);

  updateTaskState(event: MatCheckboxChange) {
    if (!this.task) {
      return;
    }

    this.task.taskCompletedAtUtc = event.checked
      ? new Date().toISOString()
      : null;
    this._taskService.updateTask(this.task, 'toggle');
  }

  deleteTask() {
    this._taskService.deleteTask(this.task);
  }

  taskClicked() {
    this._taskService.updateTaskDetail(this.task);
  }
}
