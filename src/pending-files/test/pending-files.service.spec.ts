import { Test, TestingModule } from '@nestjs/testing';
import { PendingFilesService } from '../pending-files.service';

describe('PendingFilesService', () => {
  let service: PendingFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PendingFilesService],
    }).compile();

    service = module.get<PendingFilesService>(PendingFilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
