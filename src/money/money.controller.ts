import { Body, Controller, Post } from '@nestjs/common';
import { MoneyService } from './money.service';

@Controller('/money')
export class MoneyController {
  constructor(private readonly MoneyService: MoneyService) {}
  @Post()
  async handleTransaction(
    @Body() body: { userId: number; amount: number },
  ): Promise<{ referenceId: string }> {
    const referenceId = await this.MoneyService.updateBalance(
      body.userId,
      body.amount,
    );
    return { referenceId };
  }
}
