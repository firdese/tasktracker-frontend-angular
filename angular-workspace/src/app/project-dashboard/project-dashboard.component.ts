import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectDashboardService } from './project-dashboard.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskGroup } from '../../model/task-group.types';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-project-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.scss',
})
export class ProjectDashboardComponent implements OnInit, OnDestroy {
  taskGroups: TaskGroup[] | null = null;
  sidebarOpened: boolean = true;
  constructor(private _projectDashboardService: ProjectDashboardService) {}

  ngOnInit(): void {
    this._projectDashboardService.taskGroups$.subscribe((taskGroups) => {
      this.taskGroups = taskGroups;
    });
  }

  onProjectClicked(project: any) {}

  onProjectEditClicked(project: any) {}

  onProjectDeleteClicked(project: any) {}

  addProject() {
    this._projectDashboardService.addTaskGroup();
  }

  ngOnDestroy(): void {}
}
