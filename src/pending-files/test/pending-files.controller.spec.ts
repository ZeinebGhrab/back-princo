import { Test, TestingModule } from '@nestjs/testing';
import { PendingFilesController } from '../pending-files.controller';

describe('PendingFilesController', () => {
  let controller: PendingFilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PendingFilesController],
    }).compile();

    controller = module.get<PendingFilesController>(PendingFilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
