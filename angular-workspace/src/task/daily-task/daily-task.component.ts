import { Component } from '@angular/core';
import { SingleTaskComponent } from '../single-task/single-task.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-daily-task',
  imports: [SingleTaskComponent, NgFor],
  templateUrl: './daily-task.component.html',
  styleUrl: './daily-task.component.scss',
})
export class DailyTaskComponent {
  constructor() {}

  numSequence(n: number): Array<number> {
    return Array(n);
  }
}
