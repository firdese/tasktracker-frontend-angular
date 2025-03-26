import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DailyTaskComponent } from '../task/daily-task/daily-task.component';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { TaskViewsComponent } from './task-views/task-views.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ProjectDashboardComponent,
    TaskViewsComponent,
    TaskDetailComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-workspace';
}
