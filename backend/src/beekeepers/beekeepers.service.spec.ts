import { Test, TestingModule } from '@nestjs/testing';
import { BeekeepersService } from './beekeepers.service';

describe('BeekeepersService', () => {
  let service: BeekeepersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BeekeepersService],
    }).compile();

    service = module.get<BeekeepersService>(BeekeepersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
