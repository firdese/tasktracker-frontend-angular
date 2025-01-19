import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualTaskComponent } from './individual-task.component';

describe('IndividualTaskComponent', () => {
  let component: IndividualTaskComponent;
  let fixture: ComponentFixture<IndividualTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndividualTaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndividualTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
