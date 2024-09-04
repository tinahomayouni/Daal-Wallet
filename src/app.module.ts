import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { BalanceModule } from './balance/balance.module';
import { MoneyModule } from './money/money.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    BalanceModule,
    MoneyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
