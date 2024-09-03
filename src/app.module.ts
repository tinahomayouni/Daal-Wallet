import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { BalanceModule } from './balance/balance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make the config module global
    }),
    DatabaseModule,
    BalanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
