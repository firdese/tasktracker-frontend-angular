import { Component, OnInit } from '@angular/core';
import { SingleTaskComponent } from '../single-task/single-task.component';
import { NgFor, NgIf } from '@angular/common';
import { TaskService } from '../task.service';
import { Task } from '../../model/task.types';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ProjectDashboardService } from '../../app/project-dashboard/project-dashboard.service';
import { TaskGroup } from '../../model/task-group.types';
@Component({
  selector: 'app-daily-task',
  imports: [SingleTaskComponent, NgFor, NgIf, AsyncPipe, MatIconModule, MatButtonModule, RouterOutlet],
  templateUrl: './daily-task.component.html',
  styleUrl: './daily-task.component.scss',
})
export class DailyTaskComponent implements OnInit {
  dailyTasks: Task[] | undefined = undefined;
  groupTaskId: number = 0;
  activeTaskGroup: TaskGroup | null = null;
  editingProjectDescription: boolean = false;
  projectDescriptionDraft: string = '';
  constructor(
    public _taskService: TaskService,
    private route: ActivatedRoute,
    private _projectDashboardService: ProjectDashboardService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const taskGroupId = params.get('groupTaskId');
      if (taskGroupId) {
        this.groupTaskId = parseInt(taskGroupId);
        this._taskService.loadTaskByTaskGroupId(this.groupTaskId);
        this.refreshActiveTaskGroup();
      }
    });

    this._taskService.dailyTask$.subscribe((dailyTasks) => {
      this.dailyTasks = dailyTasks;
    });

    this._projectDashboardService.taskGroups$.subscribe((taskGroups) => {
      this.refreshActiveTaskGroup(taskGroups);
    });
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  addTask() {
    this._taskService.addTask(this.groupTaskId);
  }

  startProjectDescriptionEdit() {
    this.editingProjectDescription = true;
    this.projectDescriptionDraft = this.activeTaskGroup?.taskGroupDescription ?? '';
  }

  cancelProjectDescriptionEdit(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.editingProjectDescription = false;
    this.projectDescriptionDraft = this.activeTaskGroup?.taskGroupDescription ?? '';
  }

  saveProjectDescription(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    const trimmedDescription = this.projectDescriptionDraft.trim();
    if (!this.activeTaskGroup?.taskGroupId || !trimmedDescription) {
      this.cancelProjectDescriptionEdit(event);
      return;
    }

    if (trimmedDescription === this.activeTaskGroup.taskGroupDescription) {
      this.cancelProjectDescriptionEdit(event);
      return;
    }

    this._projectDashboardService.updateTaskGroup({
      ...this.activeTaskGroup,
      taskGroupDescription: trimmedDescription,
    });

    this.editingProjectDescription = false;
  }

  private refreshActiveTaskGroup(taskGroups?: TaskGroup[] | null) {
    const groups = taskGroups ?? this._projectDashboardService.taskGroups.value;
    this.activeTaskGroup = groups?.find((group) => group.taskGroupId === this.groupTaskId) ?? null;
    if (!this.editingProjectDescription) {
      this.projectDescriptionDraft = this.activeTaskGroup?.taskGroupDescription ?? '';
    }
  }
}
