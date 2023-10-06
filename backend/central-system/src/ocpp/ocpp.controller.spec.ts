import { Test, TestingModule } from '@nestjs/testing';
import { OcppController } from './ocpp.controller';

describe('OcppController', () => {
  let controller: OcppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OcppController],
    }).compile();

    controller = module.get<OcppController>(OcppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
