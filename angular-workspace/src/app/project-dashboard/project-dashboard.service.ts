import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TaskGroup } from '../../model/task-group.types';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectDashboardService {
  private baseTaskGroupUrl: string = 'http://localhost:5000/taskgroup';
  constructor(
    private _httpClient: HttpClient,
    private _toastrService: ToastrService,
  ) {
    this.loadTaskGroups();
  }

  taskGroups: BehaviorSubject<TaskGroup[] | null> = new BehaviorSubject<
    TaskGroup[] | null
  >(null);

  get taskGroups$(): Observable<TaskGroup[] | null> {
    return this.taskGroups.asObservable();
  }

  loadTaskGroups() {
    this._httpClient
      .get<TaskGroup[]>(this.baseTaskGroupUrl)
      .subscribe((taskGroups) => {
        this.taskGroups.next(taskGroups);
      });
  }

  addTaskGroup(): Observable<TaskGroup[]> {
    const newTaskGroup: TaskGroup = { taskGroupDescription: 'new task group' };
    return this._httpClient
      .post<void>(this.baseTaskGroupUrl, [newTaskGroup])
      .pipe(
        switchMap(() => {
          return this._httpClient.get<TaskGroup[]>(this.baseTaskGroupUrl);
        }),
        tap((taskGroups) => {
          this.taskGroups.next(taskGroups);
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
        next: (taskGroupsUpdated) => {
          if (!taskGroupsUpdated.length) {
            return;
          }

          const updatedTaskGroup = taskGroupsUpdated[0];
          const currentTaskGroups = [...(this.taskGroups.value ?? [])];
          const updatedIndex = currentTaskGroups.findIndex(
            (x) => x.taskGroupId === updatedTaskGroup.taskGroupId,
          );

          if (updatedIndex >= 0) {
            currentTaskGroups.splice(updatedIndex, 1, updatedTaskGroup);
            this.taskGroups.next(currentTaskGroups);
          }

          this._toastrService.success('Project updated');
        },
        error: () => {
          this._toastrService.error('Could not update project');
        },
      });
  }

  deleteTaskGroup(taskGroup: TaskGroup) {
    if (!taskGroup.taskGroupId) {
      return;
    }

    this._httpClient
      .delete<void>(this.baseTaskGroupUrl, { body: [taskGroup] })
      .subscribe({
        next: () => {
          const remainingTaskGroups = (this.taskGroups.value ?? []).filter(
            (group) => group.taskGroupId !== taskGroup.taskGroupId,
          );
          this.taskGroups.next(remainingTaskGroups);
          this._toastrService.success('Project deleted');
        },
        error: () => {
          this._toastrService.error('Could not delete project');
        },
      });
  }
}
