import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TaskGroup } from '../../model/task-group.types';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProjectDashboardService {
  private baseTaskGroupUrl: string = 'http://localhost:5000/taskgroup';
  constructor(private _httpClient: HttpClient) {
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

  addTaskGroup() {
    const newTaskGroup: TaskGroup = { taskGroupDescription: 'new task group' };
    this._httpClient
      .post<TaskGroup[]>(this.baseTaskGroupUrl, [newTaskGroup])
      .subscribe((taskgroups) => {
        taskgroups.forEach((taskGroup) => {
          this.taskGroups.value?.push(taskGroup);
        });
      });
  }
}
