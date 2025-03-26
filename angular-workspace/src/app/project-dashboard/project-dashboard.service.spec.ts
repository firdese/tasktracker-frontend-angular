import { TestBed } from '@angular/core/testing';

import { ProjectDashboardService } from './project-dashboard.service';

describe('ProjectDashboardService', () => {
  let service: ProjectDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
