import { TestBed, inject } from '@angular/core/testing';

import { PostcontentService } from './postcontent.service';

describe('PostcontentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PostcontentService]
    });
  });

  it('should be created', inject([PostcontentService], (service: PostcontentService) => {
    expect(service).toBeTruthy();
  }));
});
