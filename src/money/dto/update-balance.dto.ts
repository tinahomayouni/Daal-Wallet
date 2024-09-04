import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class UpdateBalanceDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  userId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  amount: number;
}
