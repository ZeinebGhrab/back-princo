import { Test, TestingModule } from '@nestjs/testing';
import { ImpressionController } from '../impression.controller';

describe('ImpressionController', () => {
  let controller: ImpressionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImpressionController],
    }).compile();

    controller = module.get<ImpressionController>(ImpressionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
