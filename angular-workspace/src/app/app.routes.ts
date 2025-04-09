import { Routes } from '@angular/router';
import { DailyTaskComponent } from '../task/daily-task/daily-task.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { AppComponent } from './app.component';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: ProjectDashboardComponent,
    children: [
      {
        path: ':groupTaskId',
        component: DailyTaskComponent,
        children: [{ path: ':taskId', component: TaskDetailComponent }],
      },
    ],
  },
];
