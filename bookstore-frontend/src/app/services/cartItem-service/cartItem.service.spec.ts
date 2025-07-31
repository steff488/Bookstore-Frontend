import { TestBed } from '@angular/core/testing';

import { CartItemService } from './cartItem.service';

describe('CartService', () => {
  let service: CartItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
