import { Test, TestingModule } from '@nestjs/testing';
import { BeekeepersController } from './beekeepers.controller';

describe('BeekeepersController', () => {
  let controller: BeekeepersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BeekeepersController],
    }).compile();

    controller = module.get<BeekeepersController>(BeekeepersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
