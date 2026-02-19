import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../model/task.types';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

type UpdateTaskSource = 'toggle' | 'detail' | 'generic';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseTaskURL: string = 'http://localhost:5000/tasks';
  private _currentTaskGroupId: number | null = null;
  constructor(
    private _httpClient: HttpClient,
    private _toastrService: ToastrService,
  ) {}

  loadTaskByTaskGroupId(taskGroupId: number) {
    this._currentTaskGroupId = taskGroupId;
    this._httpClient.get<Task[]>(this.baseTaskURL, {
      params: { taskGroupId: taskGroupId.toString() },
    }).subscribe(
      (tasks) => {
        this._dailyTask.next(tasks);
      },
      (error) => {
        console.log(error);
        this._dailyTask.next([]);
      },
    );
  }

  loadTaskDetailByTaskId(taskId: number) {
    const taskFromState = this._dailyTask.value?.find((x) => x.taskId === taskId);
    if (taskFromState) {
      this._taskDetail.next(taskFromState);
      return;
    }

    if (!this._currentTaskGroupId) {
      this._taskDetail.next(undefined);
      return;
    }

    this._httpClient.get<Task[]>(this.baseTaskURL, {
      params: { taskGroupId: this._currentTaskGroupId.toString() },
    }).subscribe(
      (tasks) => {
        this._dailyTask.next(tasks);
        const taskFromApi = tasks.find((task) => task.taskId === taskId);
        this._taskDetail.next(taskFromApi);
      },
      (error) => {
        console.log(error);
        this._taskDetail.next(undefined);
      },
    );
  }

  addTask(groupTaskId: number) {
    const nowUtc = new Date().toISOString();
    const newTask: Task = {
      taskGroupId: groupTaskId,
      taskDescription: 'New task',
      taskCreatedAtUtc: nowUtc,
      taskUpdatedAtUtc: nowUtc,
      taskCompletedAtUtc: null,
    };
    this._httpClient.post<Task[]>(this.baseTaskURL, [newTask]).subscribe({
      next: (createdTasks) => {
        this.upsertTasks(createdTasks);
        this._toastrService.success('Task created');
      },
      error: (error) => {
        console.log(error);
        this._toastrService.error('Could not create task');
      },
    });
  }

  deleteTask(task: Task | undefined) {
    if (!task?.taskId) {
      return;
    }
    this._httpClient.delete<number[]>(this.baseTaskURL, { body: [task.taskId] }).subscribe({
      next: (deletedTaskIds) => {
        this.removeTasks(deletedTaskIds);
        this._toastrService.success('Task deleted');
      },
      error: (error) => {
        console.log(error);
        this._toastrService.error('Could not delete task');
      },
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

  loadDailyTask(taskGroupId: number) {
    this._currentTaskGroupId = taskGroupId;
    this._httpClient.get<Task[]>(this.baseTaskURL, {
      params: { taskGroupId: taskGroupId.toString() },
    }).subscribe(
      (tasks) => this._dailyTask.next(tasks),
      (error) => {
        console.log(error);
      },
    );
  }

  updateTask(task: Task | undefined, source: UpdateTaskSource = 'generic') {
    if (!task) {
      return;
    }
    const taskToUpdate: Task = {
      ...task,
      taskUpdatedAtUtc: new Date().toISOString(),
    };

    this._httpClient.put<Task[]>(this.baseTaskURL, [taskToUpdate]).subscribe({
      next: (tasksEdited) => {
        if (tasksEdited.length) {
          this.upsertTasks(tasksEdited);
        } else {
          this.upsertTasks([taskToUpdate]);
        }

        if (source === 'toggle') {
          this._toastrService.success(
            taskToUpdate.taskCompletedAtUtc
              ? 'Task marked as done'
              : 'Task marked as not done',
          );
          return;
        }

        if (source === 'detail') {
          this._toastrService.success('Task saved');
          return;
        }

        this._toastrService.success('Task updated');
      },
      error: (error) => {
        console.log(error);
        this._toastrService.error('Could not update task');
      },
    });

    // const removeExising: Task[] | undefined = this.dailyTask.value?.filter(
    //   (x) => x.taskId !== task?.taskId,
    // );
    // this.dailyTask.next((removeExising ?? []).concat(task ?? []));
  }

  syncTaskInState(task: Task | undefined) {
    if (!task?.taskId) {
      return;
    }

    const taskIndex = this._dailyTask.value?.findIndex(
      (x) => x.taskId === task.taskId,
    );

    if (taskIndex !== undefined && taskIndex >= 0) {
      const currentTasks = [...(this._dailyTask.value ?? [])];
      currentTasks.splice(taskIndex, 1, task);
      this._dailyTask.next(currentTasks);
    }

    if (this._taskDetail.value?.taskId === task.taskId) {
      this._taskDetail.next(task);
    }
  }

  updateTaskDetail(task: Task | undefined) {
    this._taskDetail.next(task);
  }

  private upsertTasks(tasksToUpsert: Task[]): void {
    if (!tasksToUpsert.length) {
      return;
    }

    const currentTasks = [...(this._dailyTask.value ?? [])];
    let updatedTaskDetail = this._taskDetail.value;

    tasksToUpsert.forEach((taskToUpsert) => {
      if (!taskToUpsert.taskId) {
        return;
      }

      const existingTaskIndex = currentTasks.findIndex(
        (task) => task.taskId === taskToUpsert.taskId,
      );

      if (existingTaskIndex >= 0) {
        currentTasks.splice(existingTaskIndex, 1, taskToUpsert);
      } else {
        currentTasks.push(taskToUpsert);
      }

      if (updatedTaskDetail?.taskId === taskToUpsert.taskId) {
        updatedTaskDetail = taskToUpsert;
      }
    });

    this._dailyTask.next(currentTasks);

    if (updatedTaskDetail !== this._taskDetail.value) {
      this._taskDetail.next(updatedTaskDetail);
    }
  }

  private removeTasks(taskIdsToDelete: number[]): void {
    if (!taskIdsToDelete.length) {
      return;
    }

    const taskIdsSet = new Set(taskIdsToDelete);
    const remainingTasks = (this._dailyTask.value ?? []).filter(
      (task) => !task.taskId || !taskIdsSet.has(task.taskId),
    );
    this._dailyTask.next(remainingTasks);

    if (this._taskDetail.value?.taskId && taskIdsSet.has(this._taskDetail.value.taskId)) {
      this._taskDetail.next(undefined);
    }
  }
}
