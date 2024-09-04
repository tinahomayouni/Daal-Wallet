import { Body, Controller, Post } from '@nestjs/common';
import { MoneyService } from './money.service';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@Controller('/money')
export class MoneyController {
  constructor(private readonly moneyService: MoneyService) {}

  @Post()
  async handleTransaction(
    @Body() body: UpdateBalanceDto,
  ): Promise<{ referenceId: string }> {
    const { userId, amount } = body;
    const referenceId = await this.moneyService.updateBalance(userId, amount);
    return { referenceId };
  }
}
