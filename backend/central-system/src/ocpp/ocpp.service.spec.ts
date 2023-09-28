import { Test, TestingModule } from '@nestjs/testing';
import { OcppService } from './ocpp.service';

describe('OcppService', () => {
  let service: OcppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OcppService],
    }).compile();

    service = module.get<OcppService>(OcppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
