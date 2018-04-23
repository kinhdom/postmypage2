import { TestBed, inject } from '@angular/core/testing';

import { DetailpageService } from './detailpage.service';

describe('DetailpageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetailpageService]
    });
  });

  it('should be created', inject([DetailpageService], (service: DetailpageService) => {
    expect(service).toBeTruthy();
  }));
});
