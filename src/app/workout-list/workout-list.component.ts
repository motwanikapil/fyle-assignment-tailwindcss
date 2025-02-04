import { Component, OnInit } from '@angular/core';
import { BrowserStorageService, WorkoutEntry } from '../storage.service';
import { workouts } from '../app.constants';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WorkoutListEntry {
  username: string;
  totalWorkouts: number;
  totalWorkoutMinutes: number;
  workouts: string[];
  averageWorkoutDuration: number;
}

@Component({
  selector: 'app-workout-list',
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.css'],
  standalone: true,
  imports: [NgFor, NgIf, FormsModule], // Added NgModel for two-way binding
})
export class WorkoutListComponent implements OnInit {
  workoutArray = workouts;
  allWorkoutEntries: WorkoutListEntry[] = []; // Store unfiltered data
  workoutEntries: WorkoutListEntry[] = []; // Store filtered data
  searchQuery: string = ''; // Search input state
  selectedWorkoutType: string = 'Choose Workout'; // Default filter option
  error: string | null = null;

  constructor(private storageService: BrowserStorageService) {}

  ngOnInit(): void {
    try {
      this.loadWorkoutEntries();
    } catch (err) {
      this.error = 'Failed to load workout data. Please try again later.';
      console.error('Error loading workout entries:', err);
    }
  }

  private loadWorkoutEntries(): void {
    const rawEntries: WorkoutEntry[] = this.storageService.get('workoutData');

    if (!Array.isArray(rawEntries)) {
      throw new Error('Invalid workout data format');
    }

    const userStats = new Map<string, WorkoutListEntry>();

    rawEntries.forEach(({ username, workoutType, workoutMinutes }) => {
      const existingStats = userStats.get(username) ?? {
        username,
        totalWorkouts: 0,
        totalWorkoutMinutes: 0,
        workouts: [],
        averageWorkoutDuration: 0,
      };

      userStats.set(username, {
        ...existingStats,
        totalWorkouts: existingStats.totalWorkouts + 1,
        totalWorkoutMinutes: existingStats.totalWorkoutMinutes + workoutMinutes,
        workouts: [...new Set([...existingStats.workouts, workoutType])],
        averageWorkoutDuration: Math.round(
          (existingStats.totalWorkoutMinutes + workoutMinutes) /
            (existingStats.totalWorkouts + 1)
        ),
      });
    });

    this.allWorkoutEntries = Array.from(userStats.values()).sort(
      (a, b) => b.totalWorkoutMinutes - a.totalWorkoutMinutes
    );

    this.applyFilters();
  }

  applyFilters(): void {
    this.workoutEntries = this.allWorkoutEntries.filter((entry) => {
      const matchesSearch = entry.username
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());

      const matchesFilter =
        this.selectedWorkoutType === 'Choose Workout' ||
        entry.workouts.includes(this.selectedWorkoutType);

      return matchesSearch && matchesFilter;
    });
  }
}
