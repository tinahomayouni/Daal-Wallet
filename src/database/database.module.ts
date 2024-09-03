import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'src/config/data-source';

@Module({
  imports: [TypeOrmModule.forRoot(config)],
})
export class DatabaseModule {}
