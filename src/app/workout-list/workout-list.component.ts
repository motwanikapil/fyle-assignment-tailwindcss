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
  imports: [NgFor, NgIf, FormsModule],
})
export class WorkoutListComponent implements OnInit {
  // Add 'Choose Workout' to workout array
  workoutArray = ['Choose Workout', ...workouts];
  allWorkoutEntries: WorkoutListEntry[] = [];
  filteredEntries: WorkoutListEntry[] = []; // New property to store filtered entries
  workoutEntries: WorkoutListEntry[] = [];
  searchQuery: string = '';
  selectedWorkoutType: string = 'Choose Workout';
  error: string | null = null;

  // Pagination state
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  totalItems: number = 0;

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
    const rawEntries: WorkoutEntry[] =
      this.storageService.get('workoutData') || [];

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

    this.updateFilteredEntries();
  }

  private updateFilteredEntries(): void {
    // Apply filters to get filtered entries
    this.filteredEntries = this.allWorkoutEntries.filter((entry) => {
      const matchesSearch = this.searchQuery
        ? entry.username
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase().trim())
        : true;

      const matchesFilter =
        this.selectedWorkoutType === 'Choose Workout'
          ? true
          : entry.workouts.includes(this.selectedWorkoutType);

      return matchesSearch && matchesFilter;
    });

    // Update pagination info
    this.totalItems = this.filteredEntries.length;
    this.totalPages = Math.max(
      1,
      Math.ceil(this.totalItems / this.itemsPerPage)
    );

    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    // Update displayed entries
    this.updateDisplayedEntries();
  }

  private updateDisplayedEntries(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.workoutEntries = this.filteredEntries.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateFilteredEntries();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.updateFilteredEntries();
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedEntries();
    }
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedEntries();
    }
  }

  onItemsPerPageChange(newItemsPerPage: number): void {
    this.itemsPerPage = Number(newItemsPerPage); // Ensure number type
    this.currentPage = 1;
    this.updateFilteredEntries(); // Recalculate everything with new items per page
  }

  get paginationInfo(): string {
    if (this.totalItems === 0) {
      return 'No entries to show';
    }
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(
      this.currentPage * this.itemsPerPage,
      this.totalItems
    );
    return `Showing ${startItem} to ${endItem} of ${this.totalItems} entries`;
  }
}
