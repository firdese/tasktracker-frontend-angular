import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyTaskComponent } from './daily-task/daily-task.component';

const routes: Routes = [
  {path: '', component: DailyTaskComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
