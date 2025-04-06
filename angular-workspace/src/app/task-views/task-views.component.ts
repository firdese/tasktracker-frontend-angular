import { Component, OnInit } from '@angular/core';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { DailyTaskComponent } from '../../task/daily-task/daily-task.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { DashboardView } from '../../model/dashboard-view.enum';
@Component({
  selector: 'app-task-views',
  imports: [
    DailyTaskComponent,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './task-views.component.html',
  styleUrl: './task-views.component.scss',
})
export class TaskViewsComponent implements OnInit {
  availableViews?: string[];

  ngOnInit() {
    this.availableViews = Object.values(DashboardView);
  }

  viewSelectionChanged(viewName: string) {}
}
