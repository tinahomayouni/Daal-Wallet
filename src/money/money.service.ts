import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Transaction } from '../entity/transaction.entity';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';

@Injectable()
export class MoneyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async updateBalance(userId: number, amount: number): Promise<string> {
    logger.info(`Initiating transaction: userId=${userId}, amount=${amount}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      logger.error(`User not found: userId=${userId}`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.balance += amount;
    await this.userRepository.save(user);

    const transaction = new Transaction();
    transaction.referenceId = uuidv4();
    transaction.amount = amount;
    transaction.createdAt = new Date();
    transaction.user = user;

    await this.transactionRepository.save(transaction);

    logger.info(
      `Transaction successful: referenceId=${transaction.referenceId}, userId=${userId}, amount=${amount}`,
    );

    return transaction.referenceId;
  }
}
