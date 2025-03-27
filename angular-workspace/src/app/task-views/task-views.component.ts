import { Component } from '@angular/core';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { DailyTaskComponent } from '../../task/daily-task/daily-task.component';

@Component({
  selector: 'app-task-views',
  imports: [DailyTaskComponent],
  templateUrl: './task-views.component.html',
  styleUrl: './task-views.component.scss',
})
export class TaskViewsComponent {}
