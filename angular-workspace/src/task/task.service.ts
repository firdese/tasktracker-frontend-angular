import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../model/task.types';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { HttpClient } from '@angular/common/http';
import { error } from 'console';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseTaskURL: string = 'https://localhost:44313/tasks';
  constructor(private _httpClient: HttpClient) {
    this.loadDailyTask();
  }

  addTask() {
    const newTask: Task = { taskCompleted: false, taskDescription: 'New task' };
    this._httpClient
      .post<Task[]>(this.baseTaskURL, [newTask])
      .subscribe((tasksCreated) =>
        tasksCreated.forEach((taskCreated) => {
          this.dailyTask.value?.push(taskCreated);
        }),
      );
  }

  deleteTask(task: Task | undefined) {
    this._httpClient
      .delete<Task[]>(this.baseTaskURL, { body: [task] })
      .subscribe((taskDeleted) => {
        taskDeleted.forEach((taskDeleted) => {
          const deletedIndex = this.dailyTask.value?.findIndex(
            (x) => x.taskId === taskDeleted.taskId,
          );
          if (deletedIndex) {
            this.dailyTask.value?.splice(deletedIndex, 1);
          }
        });
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
          this.animation.next('smile');
        } else {
          this.animation.next('frown');
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
