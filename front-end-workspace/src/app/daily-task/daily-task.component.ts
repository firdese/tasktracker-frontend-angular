import { Component } from '@angular/core';
import { DailyTask } from '../model/daily-task';

@Component({
  selector: 'app-daily-task',
  templateUrl: './daily-task.component.html',
  styleUrls: ['./daily-task.component.scss'],
})
export class DailyTaskComponent {
  dailyTask: DailyTask;

  constructor()
  {
    this.loadDailyTaskData();
  }

  private loadDailyTaskData(){
    this.dailyTask = {individualTasks: [{taskId: 1, taskDescription: 'first Task'}, {taskId: 2, taskDescription: 'second Task'}, {taskId: 3, taskDescription: 'third Task'} ]}
  }
}
