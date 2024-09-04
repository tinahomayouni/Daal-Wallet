import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoneyService } from './money.service';
import { User } from '../entity/user.entity';
import { Transaction } from '../entity/transaction.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

// Create a mock type for the repository
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
    userRepository = module.get(getRepositoryToken(User));
    transactionRepository = module.get(getRepositoryToken(Transaction));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if user not found', async () => {
    userRepository.findOne?.mockResolvedValue(null);

    await expect(service.updateBalance(1, 100)).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should update the user balance and create a transaction', async () => {
    const mockUser = { id: 1, balance: 100 } as User;
    userRepository.findOne?.mockResolvedValue(mockUser);
    userRepository.save?.mockResolvedValue({ ...mockUser, balance: 200 });

    const result = await service.updateBalance(1, 100);

    expect(userRepository.save).toHaveBeenCalledWith({
      ...mockUser,
      balance: 200,
    });
    expect(transactionRepository.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
