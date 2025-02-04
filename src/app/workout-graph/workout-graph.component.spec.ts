import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutGraphComponent } from './workout-graph.component';

describe('WorkoutGraphComponent', () => {
  let component: WorkoutGraphComponent;
  let fixture: ComponentFixture<WorkoutGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
