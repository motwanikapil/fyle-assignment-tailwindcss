// First, let's define the WorkoutEntry interface (storage.service.ts)
export interface WorkoutEntry {
  username: string;
  workoutType: string;
  workoutMinutes: number;
}

// storage.service.ts
import { Inject, Injectable, InjectionToken } from '@angular/core';

export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage,
});

@Injectable({
  providedIn: 'root',
})
export class BrowserStorageService {
  constructor(@Inject(BROWSER_STORAGE) public storage: Storage) {}

  get(key: string): WorkoutEntry[] {
    const data = this.storage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  set(key: string, value: WorkoutEntry) {
    if (!this.isValidWorkoutEntry(value)) {
      console.error('Invalid workout data', value);
      return;
    }

    const existingData = this.get(key);
    existingData.push(value);
    this.storage.setItem(key, JSON.stringify(existingData));
  }

  private isValidWorkoutEntry(value: any): value is WorkoutEntry {
    return (
      value &&
      typeof value.username === 'string' &&
      typeof value.workoutType === 'string' &&
      typeof value.workoutMinutes === 'number' &&
      value.workoutMinutes > 0
    );
  }
}
