import { Component, OnInit } from '@angular/core';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { BrowserStorageService, WorkoutEntry } from '../storage.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';

// Register required Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-workout-graph',
  templateUrl: './workout-graph.component.html',
  styleUrls: ['./workout-graph.component.css'],
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, BaseChartDirective],
})
export class WorkoutGraphComponent implements OnInit {
  workoutEntries: WorkoutEntry[] = [];
  selectedUser: string = '';
  users: string[] = [];
  chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };
  error: string | null = null;

  constructor(private storageService: BrowserStorageService) {}

  ngOnInit(): void {
    this.loadWorkoutData();
  }

  private loadWorkoutData(): void {
    try {
      const rawEntries: WorkoutEntry[] = this.storageService.get('workoutData');

      if (!Array.isArray(rawEntries)) {
        throw new Error('Invalid workout data format');
      }

      this.workoutEntries = rawEntries;
      this.extractUsers();
    } catch (err) {
      this.error = 'Failed to load workout data. Please try again later.';
      console.error('Error fetching workout data:', err);
    }
  }

  extractUsers(): void {
    this.users = [
      ...new Set(this.workoutEntries.map((entry) => entry.username)),
    ];
  }

  updateChart(): void {
    if (!this.selectedUser) return;

    const userWorkouts = this.workoutEntries.filter(
      (entry) => entry.username === this.selectedUser
    );
    const workoutTypes = [
      ...new Set(userWorkouts.map((entry) => entry.workoutType)),
    ];

    const minutesData = workoutTypes.map((type) =>
      userWorkouts
        .filter((entry) => entry.workoutType === type)
        .reduce((sum, entry) => sum + entry.workoutMinutes, 0)
    );

    this.chartData = {
      labels: workoutTypes,
      datasets: [
        {
          label: 'Workout Minutes',
          data: minutesData,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }
}
