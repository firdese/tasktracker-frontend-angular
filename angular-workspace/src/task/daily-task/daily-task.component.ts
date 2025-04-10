import { Component, OnInit } from '@angular/core';
import { SingleTaskComponent } from '../single-task/single-task.component';
import { NgFor } from '@angular/common';
import { TaskService } from '../task.service';
import { Task } from '../../model/task.types';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-daily-task',
  imports: [SingleTaskComponent, NgFor, AsyncPipe, MatIconModule, RouterOutlet],
  templateUrl: './daily-task.component.html',
  styleUrl: './daily-task.component.scss',
})
export class DailyTaskComponent implements OnInit {
  dailyTasks: Task[] | undefined = undefined;
  groupTaskId: number = 0;
  constructor(
    public _taskService: TaskService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const taskGroupId = params.get('groupTaskId');
      if (taskGroupId) {
        this.groupTaskId = parseInt(taskGroupId);
        this._taskService.loadTaskByTaskGroupId(this.groupTaskId);
      }
    });

    this._taskService.dailyTask$.subscribe((dailyTasks) => {
      this.dailyTasks = dailyTasks;
    });
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  addTask() {
    this._taskService.addTask(this.groupTaskId);
  }
}
