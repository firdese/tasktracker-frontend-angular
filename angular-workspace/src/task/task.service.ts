import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../model/task.types';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { HttpClient } from '@angular/common/http';
import { error } from 'console';
import { ProjectDashboardService } from '../app/project-dashboard/project-dashboard.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseTaskURL: string = 'http://localhost:5000/tasks';
  constructor(
    private _httpClient: HttpClient,
    private _projectDashboardService: ProjectDashboardService,
    private _toastrService: ToastrService,
  ) {
    this.loadDailyTask();
  }

  loadTaskByTaskGroupId(taskGroupId: number) {
    const taskGroup = this._projectDashboardService.taskGroups.value?.find(
      (x) => x.taskGroupId === taskGroupId,
    );
    this.dailyTask.next(taskGroup?.tasks);
  }

  loadTaskDetailByTaskId(taskId: number) {
    const task = this.dailyTask.value?.find((x) => x.taskId === taskId);
    if (task) {
      this.taskDetail.next(task);
    }
  }

  addTask(groupTaskId: number) {
    const newTask: Task = {
      taskCompleted: false,
      taskGroupId: groupTaskId,
      taskDescription: 'New task',
    };
    this._httpClient
      .post<Task[]>(this.baseTaskURL, [newTask])
      .subscribe((tasksCreated) =>
        tasksCreated.forEach((taskCreated) => {
          this.dailyTask.value?.push(taskCreated);
        }),
      );
  }

  deleteTask(task: Task | undefined) {
    if (!task) {
      return;
    }
    this._httpClient
      .delete<any>(this.baseTaskURL, { body: [task] })
      .subscribe((response) => {
        const deletedIndex = this.dailyTask.value?.findIndex(
          (x) => x.taskId === task.taskId,
        );
        if (deletedIndex) {
          this.dailyTask.next(
            this.dailyTask.value?.filter((_, i) => i !== deletedIndex),
          );
        }
      });
  }

  dailyTask: BehaviorSubject<Task[] | undefined> = new BehaviorSubject<
    Task[] | undefined
  >(undefined);

  taskDetail: BehaviorSubject<Task | undefined> = new BehaviorSubject<
    Task | undefined
  >(undefined);

  animation: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get dailyTask$(): Observable<Task[] | undefined> {
    return this.dailyTask.asObservable();
  }

  get animation$(): Observable<string> {
    return this.animation.asObservable();
  }

  get taskDetail$(): Observable<Task | undefined> {
    return this.taskDetail.asObservable();
  }

  loadDailyTask() {
    this._httpClient.get<Task[]>(this.baseTaskURL).subscribe(
      (tasks) => this.dailyTask.next(tasks),
      (error) => {
        console.log(error);
      },
    );
  }

  updateTask(task: Task | undefined) {
    this._httpClient
      .put<Task[]>(this.baseTaskURL, [task])
      .subscribe((tasksEdited) => {
        tasksEdited.forEach((taskEdited) => {
          const indexOfEditedTask = this.dailyTask.value?.findIndex(
            (x) => x.taskId === taskEdited.taskId,
          );
          if (indexOfEditedTask) {
            this.dailyTask.value?.splice(indexOfEditedTask, 1, taskEdited);
          }
        });

        if (task?.taskCompleted) {
          this._toastrService.success('Noice! 😉');
        } else {
        }
      });

    // const removeExising: Task[] | undefined = this.dailyTask.value?.filter(
    //   (x) => x.taskId !== task?.taskId,
    // );
    // this.dailyTask.next((removeExising ?? []).concat(task ?? []));
  }

  updateTaskDetail(task: Task | undefined) {
    this.taskDetail.next(task);
  }
}
