import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BalanceService } from './balance.service';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockUserRepository = (): MockRepository<User> => ({
  findOne: jest.fn(),
});

describe('BalanceService', () => {
  let service: BalanceService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if user not found', async () => {
    userRepository.findOne?.mockResolvedValue(null);

    await expect(service.getUserBalance(1)).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should return the user balance if user is found', async () => {
    const mockUser = { id: 1, balance: 100 } as User;
    userRepository.findOne?.mockResolvedValue(mockUser);

    const balance = await service.getUserBalance(1);
    expect(balance).toBe(100);
  });
});
