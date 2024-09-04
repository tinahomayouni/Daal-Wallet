import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { Transaction } from '../entity/transaction.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MoneyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async updateBalance(userId: number, amount: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.balance += amount;

    await this.userRepository.save(user);

    const transaction = new Transaction();
    transaction.referenceId = uuidv4();
    transaction.amount = amount;
    transaction.createdAt = new Date(); // Ensure createdAt is set
    transaction.user = user;

    await this.transactionRepository.save(transaction);

    return transaction.referenceId;
  }
}
