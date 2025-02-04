import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { WorkoutFormComponent } from './workout-form/workout-form.component';
import { WorkoutListComponent } from './workout-list/workout-list.component';
import { WorkoutGraphComponent } from './workout-graph/workout-graph.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'addworkout',
    component: WorkoutFormComponent,
  },
  {
    path: 'listworkout',
    component: WorkoutListComponent,
  },
  {
    path: 'workoutgraph',
    component: WorkoutGraphComponent,
  },
];
