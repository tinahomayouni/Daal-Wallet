// src/money/money.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Transaction } from '../entity/transaction.entity';
import { MoneyController } from './money.controller';
import { MoneyService } from './money.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction])],
  controllers: [MoneyController],
  providers: [MoneyService],
})
export class MoneyModule {}
