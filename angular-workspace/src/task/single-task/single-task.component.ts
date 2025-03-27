import { Component, Input } from '@angular/core';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { Task } from '../../model/task.types';
import { TaskService } from '../task.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-single-task',
  imports: [
    MatCheckboxModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './single-task.component.html',
  styleUrl: './single-task.component.scss',
})
export class SingleTaskComponent {
  @Input() task: Task | undefined = undefined;

  constructor(private _taskService: TaskService) {}

  updateTaskState(event: MatCheckboxChange) {
    this.task!.taskCompleted = event.checked;
    this._taskService.updateTaskState(this.task);
  }

  deleteTask() {
    this._taskService.deleteTask(this.task);
  }

  taskClicked() {}
}
