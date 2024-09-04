import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('BalanceController', () => {
  let controller: BalanceController;
  let service: BalanceService;

  const mockBalanceService = {
    getUserBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceController],
      providers: [
        {
          provide: BalanceService,
          useValue: mockBalanceService,
        },
      ],
    }).compile();

    controller = module.get<BalanceController>(BalanceController);
    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw an error if userId is not provided', async () => {
    await expect(controller.getBalance(undefined)).rejects.toThrow(
      new HttpException('User ID is required', HttpStatus.BAD_REQUEST),
    );
  });

  it('should return the user balance when userId is provided', async () => {
    mockBalanceService.getUserBalance.mockResolvedValue(100);

    const result = await controller.getBalance(1);

    expect(result).toEqual({ balance: 100 });
    expect(mockBalanceService.getUserBalance).toHaveBeenCalledWith(1);
  });
});
