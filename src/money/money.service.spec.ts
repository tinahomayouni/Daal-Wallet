import { Test, TestingModule } from '@nestjs/testing';
import { MoneyService } from './money.service';
import { User } from '../entity/user.entity';
import { Transaction } from '../entity/transaction.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { logger } from '../logger';
import { v4 as uuidv4 } from 'uuid';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockUserRepository = (): MockRepository<User> => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockTransactionRepository = (): MockRepository<Transaction> => ({
  save: jest.fn(),
});

describe('MoneyService', () => {
  let service: MoneyService;
  let userRepository: MockRepository<User>;
  let transactionRepository: MockRepository<Transaction>;
  let loggerInfo: jest.SpyInstance;
  let loggerError: jest.SpyInstance;

  beforeEach(async () => {
    loggerInfo = jest.spyOn(logger, 'info').mockImplementation();
    loggerError = jest.spyOn(logger, 'error').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoneyService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository(),
        },
      ],
    }).compile();

    service = module.get<MoneyService>(MoneyService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    transactionRepository = module.get<MockRepository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log transaction details and errors', async () => {
    const mockUser = { id: 1, balance: 100 } as User;
    userRepository.findOne.mockResolvedValue(mockUser);
    userRepository.save.mockResolvedValue({ ...mockUser, balance: 200 });

    const mockTransaction = {
      referenceId: uuidv4(),
      amount: 100,
    } as Transaction;
    transactionRepository.save.mockResolvedValue(mockTransaction);

    await service.updateBalance(1, 100);

    expect(loggerInfo).toHaveBeenCalledWith(
      `Initiating transaction: userId=1, amount=100`,
    );
    expect(loggerInfo).toHaveBeenCalledWith(
      `Transaction successful: referenceId=${mockTransaction.referenceId}, userId=1, amount=100`,
    );
    expect(loggerError).not.toHaveBeenCalled();
  });

  it('should log an error if the user is not found', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.updateBalance(1, 100)).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );

    expect(loggerError).toHaveBeenCalledWith(`User not found: userId=1`);
  });
});
