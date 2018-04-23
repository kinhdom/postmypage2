import { TestBed, inject } from '@angular/core/testing';

import { NewcommentService } from './newcomment.service';

describe('NewcommentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NewcommentService]
    });
  });

  it('should be created', inject([NewcommentService], (service: NewcommentService) => {
    expect(service).toBeTruthy();
  }));
});
