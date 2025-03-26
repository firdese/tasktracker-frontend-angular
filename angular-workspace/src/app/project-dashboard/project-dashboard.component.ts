import { Component } from '@angular/core';
import { ProjectDashboardService } from './project-dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-dashboard',
  imports: [CommonModule],
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.scss',
})
export class ProjectDashboardComponent {
  items: any[] = [{ test: 1 }, { test: 1 }, { test: 1 }];
  constructor(_projectDashboardService: ProjectDashboardService) {}
}
