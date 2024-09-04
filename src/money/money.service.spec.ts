import { Test, TestingModule } from '@nestjs/testing';
import { MoneyService } from './money.service';
import { User } from '../entity/user.entity';
import { Transaction } from '../entity/transaction.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
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

  beforeEach(async () => {
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

  it('should throw an error if the user is not found', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.updateBalance(1, 100)).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should update the user balance and return a reference ID', async () => {
    const mockUser = { id: 1, balance: 100 } as User;
    userRepository.findOne.mockResolvedValue(mockUser);
    userRepository.save.mockResolvedValue({ ...mockUser, balance: 200 });

    const mockTransaction = {
      referenceId: uuidv4(),
      amount: 100,
    } as Transaction;
    transactionRepository.save.mockResolvedValue(mockTransaction);

    const referenceId = await service.updateBalance(1, 100);

    expect(referenceId).toBe(mockTransaction.referenceId);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(userRepository.save).toHaveBeenCalledWith({
      ...mockUser,
      balance: 200,
    });
    expect(transactionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        referenceId: expect.any(String),
        amount: 100,
        user: mockUser,
      }),
    );
  });

  it('should correctly handle a negative amount to decrease the balance', async () => {
    const mockUser = { id: 1, balance: 200 } as User;
    userRepository.findOne.mockResolvedValue(mockUser);
    userRepository.save.mockResolvedValue({ ...mockUser, balance: 100 });

    const mockTransaction = {
      referenceId: uuidv4(),
      amount: -100,
    } as Transaction;
    transactionRepository.save.mockResolvedValue(mockTransaction);

    const referenceId = await service.updateBalance(1, -100);

    expect(referenceId).toBe(mockTransaction.referenceId);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(userRepository.save).toHaveBeenCalledWith({
      ...mockUser,
      balance: 100,
    });
    expect(transactionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        referenceId: expect.any(String),
        amount: -100,
        user: mockUser,
      }),
    );
  });

  it('should create a transaction with the correct timestamp', async () => {
    const mockUser = { id: 1, balance: 100 } as User;
    userRepository.findOne.mockResolvedValue(mockUser);
    userRepository.save.mockResolvedValue(mockUser);

    const mockTransaction = {
      referenceId: uuidv4(),
      amount: 100,
    } as Transaction;
    transactionRepository.save.mockResolvedValue(mockTransaction);

    await service.updateBalance(1, 100);

    expect(transactionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: expect.any(Date),
      }),
    );
  });

  it('should handle concurrent updates by ensuring transactions are processed in order', async () => {
    const mockUser = { id: 1, balance: 100 } as User;
    userRepository.findOne.mockResolvedValue(mockUser);

    const transactionOne = service.updateBalance(1, 100);
    const transactionTwo = service.updateBalance(1, -50);

    userRepository.save.mockResolvedValueOnce({ ...mockUser, balance: 200 });
    userRepository.save.mockResolvedValueOnce({ ...mockUser, balance: 150 });

    const referenceIdOne = await transactionOne;
    const referenceIdTwo = await transactionTwo;

    expect(referenceIdOne).not.toBe(referenceIdTwo);
    expect(userRepository.save).toHaveBeenCalledTimes(2);
    expect(transactionRepository.save).toHaveBeenCalledTimes(2);
  });
});
