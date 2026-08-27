import { Test, TestingModule } from '@nestjs/testing';
import { HivesController } from './hives.controller';

describe('HivesController', () => {
  let controller: HivesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HivesController],
    }).compile();

    controller = module.get<HivesController>(HivesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
