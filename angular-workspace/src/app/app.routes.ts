import { Routes } from '@angular/router';
import { DailyTaskComponent } from '../task/daily-task/daily-task.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: ProjectDashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: ':groupTaskId',
        component: DailyTaskComponent,
        children: [{ path: ':taskId', component: TaskDetailComponent }],
      },
    ],
  },
];
