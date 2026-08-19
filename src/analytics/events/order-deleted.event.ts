import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class OrderDeletedEvent {
  @IsInt() @IsPositive() orderId!: number;
  @IsNumber() @IsPositive() totalAmount!: number;
}
