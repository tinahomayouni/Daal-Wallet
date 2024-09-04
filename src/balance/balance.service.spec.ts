import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
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

  it('should return the user balance if user exists', async () => {
    const mockUser = { id: 1, balance: 150 } as User;
    userRepository.findOne.mockResolvedValue(mockUser);

    const balance = await service.getUserBalance(1);
    expect(balance).toBe(150);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should throw an error if the user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.getUserBalance(1)).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should handle a case where the balance is zero', async () => {
    const mockUser = { id: 2, balance: 0 } as User;
    userRepository.findOne.mockResolvedValue(mockUser);

    const balance = await service.getUserBalance(2);
    expect(balance).toBe(0);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
  });

  it('should call the repository with correct parameters', async () => {
    const mockUser = { id: 3, balance: 200 } as User;
    userRepository.findOne.mockResolvedValue(mockUser);

    await service.getUserBalance(3);

    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 3 } });
  });

  it('should throw an error if userId is invalid (e.g., negative)', async () => {
    await expect(service.getUserBalance(-1)).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });
});
