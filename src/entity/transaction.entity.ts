// src/entity/transaction.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  referenceId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;
}
