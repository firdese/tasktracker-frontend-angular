import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DailyTaskComponent } from '../task/daily-task/daily-task.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DailyTaskComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-workspace';
}
