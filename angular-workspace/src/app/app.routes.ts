import { Routes } from '@angular/router';
import { DailyTaskComponent } from '../task/daily-task/daily-task.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';

export const routes: Routes = [
  {
    path: ':groupTaskId',
    component: DailyTaskComponent,
    children: [{ path: ':taskId', component: TaskDetailComponent }],
  },
];
