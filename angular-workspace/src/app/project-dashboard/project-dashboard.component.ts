import { Component } from '@angular/core';
import { ProjectDashboardService } from './project-dashboard.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-project-dashboard',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.scss',
})
export class ProjectDashboardComponent {
  items: any[] = [{ test: 1 }, { test: 1 }, { test: 1 }];
  constructor(_projectDashboardService: ProjectDashboardService) {}

  onProjectClicked(project: any) {}

  onProjectEditClicked(project: any) {}

  onProjectDeleteClicked(project: any) {}
}
