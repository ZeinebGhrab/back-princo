import { Test, TestingModule } from '@nestjs/testing';
import { ImpressionService } from '../impression.service';

describe('ImpressionService', () => {
  let service: ImpressionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImpressionService],
    }).compile();

    service = module.get<ImpressionService>(ImpressionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
