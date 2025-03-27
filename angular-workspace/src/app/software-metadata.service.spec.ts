import { TestBed } from '@angular/core/testing';

import { SoftwareMetadataService } from './software-metadata.service';

describe('SoftwareMetadataService', () => {
  let service: SoftwareMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoftwareMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
