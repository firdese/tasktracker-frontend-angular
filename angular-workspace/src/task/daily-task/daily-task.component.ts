import { Component, OnInit } from '@angular/core';
import { SingleTaskComponent } from '../single-task/single-task.component';
import { NgFor } from '@angular/common';
import { TaskService } from '../task.service';
import { Task } from '../../model/task.types';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-daily-task',
  imports: [SingleTaskComponent, NgFor, AsyncPipe, MatIconModule],
  templateUrl: './daily-task.component.html',
  styleUrl: './daily-task.component.scss',
})
export class DailyTaskComponent implements OnInit {
  constructor(public _taskService: TaskService) {}

  ngOnInit(): void {}

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  addTask() {
    this._taskService.addTask();
  }
}
