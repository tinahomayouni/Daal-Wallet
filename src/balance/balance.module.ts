import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { User } from 'src/entity/user.entity';
import { Transaction } from 'src/entity/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction])],
  providers: [BalanceService],
  controllers: [BalanceController],
})
export class BalanceModule {}
