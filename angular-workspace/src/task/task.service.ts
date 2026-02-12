import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../model/task.types';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseTaskURL: string = 'http://localhost:5000/tasks';
  constructor(
    private _httpClient: HttpClient,
    private _toastrService: ToastrService,
  ) {}

  loadTaskByTaskGroupId(taskGroupId: number) {
    console.log('Loading tasks for group id:', taskGroupId);
    this._httpClient.get<Task[]>(this.baseTaskURL).subscribe(
      (tasks) => {
        console.log(tasks);
        this._dailyTask.next(
          tasks.filter((task) => task.taskGroupId === taskGroupId),
        );
      },
      (error) => {
        console.log(error);
        this._dailyTask.next([]);
      },
    );
  }

  loadTaskDetailByTaskId(taskId: number) {
    const task = this._dailyTask.value?.find((x) => x.taskId === taskId);
    if (task) {
      this._taskDetail.next(task);
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
      .subscribe({
        next: () => this.loadTaskByTaskGroupId(groupTaskId),
        error: (error) => console.log(error),
      });
  }

  deleteTask(task: Task | undefined) {
    if (!task) {
      return;
    }
    this._httpClient
      .delete<any>(this.baseTaskURL, { body: [task] })
      .subscribe(() => {
        const deletedIndex = this._dailyTask.value?.findIndex(
          (x) => x.taskId === task.taskId,
        );
        if (deletedIndex !== undefined && deletedIndex >= 0) {
          this._dailyTask.next(
            this._dailyTask.value?.filter((_, i) => i !== deletedIndex),
          );
        }
      });
  }

  private _dailyTask: BehaviorSubject<Task[] | undefined> = new BehaviorSubject<
    Task[] | undefined
  >(undefined);

  private _taskDetail: BehaviorSubject<Task | undefined> = new BehaviorSubject<
    Task | undefined
  >(undefined);

  animation: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get dailyTask$(): Observable<Task[] | undefined> {
    return this._dailyTask.asObservable();
  }

  get animation$(): Observable<string> {
    return this.animation.asObservable();
  }

  get taskDetail$(): Observable<Task | undefined> {
    return this._taskDetail.asObservable();
  }

  loadDailyTask() {
    this._httpClient.get<Task[]>(this.baseTaskURL).subscribe(
      (tasks) => this._dailyTask.next(tasks),
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
          const indexOfEditedTask = this._dailyTask.value?.findIndex(
            (x) => x.taskId === taskEdited.taskId,
          );
          if (indexOfEditedTask !== undefined && indexOfEditedTask >= 0) {
            const currentTasks = [...(this._dailyTask.value ?? [])];
            currentTasks.splice(indexOfEditedTask, 1, taskEdited);
            this._dailyTask.next(currentTasks);
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
    this._taskDetail.next(task);
  }
}
