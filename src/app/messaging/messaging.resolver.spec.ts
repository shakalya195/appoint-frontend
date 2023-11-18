import { TestBed } from '@angular/core/testing';

import { MessagingResolver } from './messaging.resolver';

describe('MessagingResolver', () => {
  let resolver: MessagingResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(MessagingResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
