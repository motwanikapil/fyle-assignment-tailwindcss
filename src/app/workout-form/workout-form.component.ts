import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { workouts } from '../app.constants';
import { NgFor, NgIf } from '@angular/common';
import { BrowserStorageService, WorkoutEntry } from '../storage.service';

interface WorkoutForm {
  username: FormControl<string>;
  workoutType: FormControl<string>;
  workoutMinutes: FormControl<number | null>;
}

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './workout-form.component.html',
  styleUrl: './workout-form.component.css',
})
export class WorkoutFormComponent {
  workoutArray = workouts;
  profileForm: FormGroup<WorkoutForm>;
  successMessage: string | null = null; // New state for notification

  constructor(private storage: BrowserStorageService) {
    this.profileForm = new FormGroup<WorkoutForm>({
      username: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3)],
        nonNullable: true,
      }),
      workoutType: new FormControl(this.workoutArray[0], {
        validators: [this.workoutTypeValidator()],
        nonNullable: true,
      }),
      workoutMinutes: new FormControl<number | null>(null, {
        validators: [
          Validators.required,
          Validators.min(5),
          Validators.max(300),
        ],
      }),
    });
  }

  workoutTypeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      return control.value === 'Choose Workout'
        ? { invalidWorkout: true }
        : null;
    };
  }

  onSubmit(): void {
    if (
      this.profileForm.valid &&
      this.profileForm.value.workoutMinutes !== null
    ) {
      const formValue = this.profileForm.value;

      const workoutEntry: WorkoutEntry = {
        username: formValue.username!,
        workoutType: formValue.workoutType!,
        workoutMinutes: formValue.workoutMinutes!,
      };

      this.storage.set('workoutData', workoutEntry);

      // Show success message
      this.successMessage = 'Workout saved successfully!';

      // Reset the form after submission
      this.profileForm.reset();

      // Hide message after 3 seconds
      setTimeout(() => {
        this.successMessage = null;
      }, 3000);
    } else {
      console.log('Form is invalid!');
    }
  }

  hasError(controlName: keyof WorkoutForm, error: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!control?.hasError(error) && !!control?.touched;
  }
}
