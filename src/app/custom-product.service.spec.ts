import { TestBed } from '@angular/core/testing';

import { CustomProductService } from './custom-product.service';

describe('CustomProductService', () => {
  let service: CustomProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
