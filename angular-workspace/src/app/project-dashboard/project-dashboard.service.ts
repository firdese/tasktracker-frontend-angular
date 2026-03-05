import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { TaskGroup } from '../../model/task-group.types';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProjectDashboardService {
  private baseTaskGroupUrl: string = 'http://localhost:5000/taskgroup';
  constructor(
    private _httpClient: HttpClient,
    private _toastrService: ToastrService,
  ) {}

  taskGroups: BehaviorSubject<TaskGroup[] | null> = new BehaviorSubject<
    TaskGroup[] | null
  >(null);

  get taskGroups$(): Observable<TaskGroup[] | null> {
    return this.taskGroups.asObservable();
  }

  loadTaskGroups() {
    this._httpClient.get<TaskGroup[]>(this.baseTaskGroupUrl).subscribe({
      next: (taskGroups) => {
        this.taskGroups.next(taskGroups);
      },
      error: (error) => {
        console.error('Failed to load projects', error);
      },
    });
  }

  addTaskGroup(): Observable<TaskGroup[]> {
    const newTaskGroup: TaskGroup = { taskGroupDescription: 'new task group' };
    return this._httpClient
      .post<TaskGroup[]>(this.baseTaskGroupUrl, [newTaskGroup])
      .pipe(
        tap((createdTaskGroups) => {
          this.upsertTaskGroups(createdTaskGroups);
        }),
        catchError((error) => {
          this._toastrService.error('Could not create project');
          return throwError(() => error);
        }),
      );
  }

  updateTaskGroup(taskGroup: TaskGroup) {
    this._httpClient
      .put<TaskGroup[]>(this.baseTaskGroupUrl, [taskGroup])
      .subscribe({
        next: (updatedTaskGroups) => {
          this.upsertTaskGroups(updatedTaskGroups);
          this._toastrService.success('Project updated');
        },
        error: () => {
          this._toastrService.error('Could not update project');
        },
      });
  }

  deleteTaskGroup(taskGroup: TaskGroup): Observable<number[]> {
    if (!taskGroup.taskGroupId) {
      return throwError(
        () => new Error('Task group id is required for deletion'),
      );
    }

    return this._httpClient
      .delete<
        number[]
      >(this.baseTaskGroupUrl, { body: [taskGroup.taskGroupId] })
      .pipe(
        tap((deletedTaskGroupIds) => {
          this.removeTaskGroups(deletedTaskGroupIds);
          this._toastrService.success('Project deleted');
        }),
        catchError((error) => {
          this._toastrService.error('Could not delete project');
          return throwError(() => error);
        }),
      );
  }

  private upsertTaskGroups(taskGroupsToUpsert: TaskGroup[]): void {
    if (!taskGroupsToUpsert.length) {
      return;
    }

    const currentTaskGroups = [...(this.taskGroups.value ?? [])];

    taskGroupsToUpsert.forEach((taskGroupToUpsert) => {
      if (!taskGroupToUpsert.taskGroupId) {
        return;
      }

      const existingTaskGroupIndex = currentTaskGroups.findIndex(
        (taskGroup) => taskGroup.taskGroupId === taskGroupToUpsert.taskGroupId,
      );

      if (existingTaskGroupIndex >= 0) {
        currentTaskGroups.splice(existingTaskGroupIndex, 1, taskGroupToUpsert);
        return;
      }

      currentTaskGroups.push(taskGroupToUpsert);
    });

    this.taskGroups.next(currentTaskGroups);
  }

  private removeTaskGroups(taskGroupIdsToDelete: number[]): void {
    if (!taskGroupIdsToDelete.length) {
      return;
    }

    const taskGroupIdsSet = new Set(taskGroupIdsToDelete);
    const remainingTaskGroups = (this.taskGroups.value ?? []).filter(
      (taskGroup) =>
        !taskGroup.taskGroupId || !taskGroupIdsSet.has(taskGroup.taskGroupId),
    );

    this.taskGroups.next(remainingTaskGroups);
  }
}
