import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectDashboardService } from './project-dashboard.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskGroup } from '../../model/task-group.types';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
  editingProjectId: number | null = null;
  editingProjectDescription: string = '';
  constructor(
    private _projectDashboardService: ProjectDashboardService,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    this._projectDashboardService.taskGroups$.subscribe((taskGroups) => {
      this.taskGroups = taskGroups;
    });
  }

  onProjectClicked(project: any) {}

  onProjectEditClicked(project: TaskGroup, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.editingProjectId = project.taskGroupId ?? null;
    this.editingProjectDescription = project.taskGroupDescription ?? '';
  }

  saveProjectDescription(project: TaskGroup, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    const trimmedDescription = this.editingProjectDescription.trim();
    if (!trimmedDescription || !project.taskGroupId) {
      this.cancelProjectEdit(event);
      return;
    }

    if (trimmedDescription === project.taskGroupDescription) {
      this.cancelProjectEdit(event);
      return;
    }

    this._projectDashboardService.updateTaskGroup({
      ...project,
      taskGroupDescription: trimmedDescription,
    });

    this.editingProjectId = null;
    this.editingProjectDescription = '';
  }

  cancelProjectEdit(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.editingProjectId = null;
    this.editingProjectDescription = '';
  }

  onProjectDeleteClicked(project: TaskGroup) {
    if (!project.taskGroupId) {
      return;
    }

    const deletedTaskGroupId = project.taskGroupId;
    const isDeletingActiveProject = this._router.url
      .split('?')[0]
      .split('/')
      .some((segment) => segment === `${deletedTaskGroupId}`);

    this._projectDashboardService.deleteTaskGroup(project).subscribe({
      next: () => {
        if (isDeletingActiveProject) {
          this._router.navigate(['/']);
        }
      },
    });

    if (this.editingProjectId === project.taskGroupId) {
      this.cancelProjectEdit();
    }
  }

  addProject() {
    this._projectDashboardService.addTaskGroup().subscribe({
      next: (createdTaskGroups) => {
        const createdTaskGroupId = createdTaskGroups[0]?.taskGroupId;
        if (createdTaskGroupId) {
          this._router.navigate(['/', createdTaskGroupId]);
        }
      },
    });
  }

  ngOnDestroy(): void {}
}
