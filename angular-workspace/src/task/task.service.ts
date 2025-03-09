import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../model/task.types';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  addTask() {
    const newTask: Task | undefined = {
      taskId: 1,
      taskDescription: 'New Task',
      taskCompleted: false,
    };

    this.dailyTask.value?.push(newTask);
  }
  deleteTask(task: Task | undefined) {
    const index = this.dailyTask.value?.findIndex(
      (task) => task.taskId === task?.taskId,
    );
    if (index !== -1 && index !== undefined) {
      this.dailyTask.value?.splice(index, 1);
    }
  }
  constructor() {
    this.loadDailyTask();
  }

  dailyTask: BehaviorSubject<Task[] | undefined> = new BehaviorSubject<
    Task[] | undefined
  >(undefined);

  animation: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get dailyTask$(): Observable<Task[] | undefined> {
    return this.dailyTask.asObservable();
  }

  get animation$(): Observable<string> {
    return this.animation.asObservable();
  }

  loadDailyTask() {
    const mockDailyTask: Task[] = [
      { taskId: 1, taskDescription: 'Makan', taskCompleted: false },
      { taskId: 2, taskDescription: 'Kerja', taskCompleted: false },
      { taskId: 3, taskDescription: 'Tidor', taskCompleted: false },
    ];
    this.dailyTask.next(mockDailyTask);
  }

  updateTaskState(task: Task | undefined) {
    if (task?.taskCompleted) {
      this.animation.next('smile');
    } else {
      this.animation.next('frown');
    }
    // const removeExising: Task[] | undefined = this.dailyTask.value?.filter(
    //   (x) => x.taskId !== task?.taskId,
    // );
    // this.dailyTask.next((removeExising ?? []).concat(task ?? []));
  }
}
