import { TestBed } from '@angular/core/testing';

import { IrcService } from './irc.service';

describe('IrcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IrcService = TestBed.get(IrcService);
    expect(service).toBeTruthy();
  });
});
