import { TestBed } from '@angular/core/testing';

import { ChargeStationService } from './charge-station.service';

describe('ChargeStationService', () => {
  let service: ChargeStationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChargeStationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
