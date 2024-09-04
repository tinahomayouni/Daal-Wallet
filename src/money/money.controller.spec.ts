import { Test, TestingModule } from '@nestjs/testing';
import { MoneyController } from './money.controller';
import { MoneyService } from './money.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MoneyController', () => {
  let controller: MoneyController;
  let service: MoneyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoneyController],
      providers: [
        {
          provide: MoneyService,
          useValue: {
            updateBalance: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoneyController>(MoneyController);
    service = module.get<MoneyService>(MoneyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleTransaction', () => {
    it('should throw an error if userId is missing', async () => {
      await expect(
        controller.handleTransaction({ amount: 100 } as any),
      ).rejects.toThrow(
        new HttpException('Validation failed', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error if amount is missing', async () => {
      await expect(
        controller.handleTransaction({ userId: 1 } as any),
      ).rejects.toThrow(
        new HttpException('Validation failed', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error if userId is not positive', async () => {
      await expect(
        controller.handleTransaction({ userId: -1, amount: 100 } as any),
      ).rejects.toThrow(
        new HttpException('Validation failed', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error if amount is not positive', async () => {
      await expect(
        controller.handleTransaction({ userId: 1, amount: -100 } as any),
      ).rejects.toThrow(
        new HttpException('Validation failed', HttpStatus.BAD_REQUEST),
      );
    });

    it('should call updateBalance and return referenceId', async () => {
      const mockReferenceId = 'mock-uuid';
      jest.spyOn(service, 'updateBalance').mockResolvedValue(mockReferenceId);
      const result = await controller.handleTransaction({
        userId: 1,
        amount: 100,
      });
      expect(result).toEqual({ referenceId: mockReferenceId });
    });
  });
});
