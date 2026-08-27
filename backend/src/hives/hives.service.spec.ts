import { Test, TestingModule } from '@nestjs/testing';
import { HivesService } from './hives.service';

describe('HivesService', () => {
  let service: HivesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HivesService],
    }).compile();

    service = module.get<HivesService>(HivesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
