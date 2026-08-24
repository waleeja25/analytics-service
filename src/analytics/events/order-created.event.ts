import { IsDateString, IsInt, IsNumber, IsPositive } from 'class-validator';

export class OrderCreatedEvent {
  @IsInt() @IsPositive() orderId!: number;
  @IsInt() @IsPositive() userId!: number;
  @IsNumber() @IsPositive() totalAmount!: number;
  @IsDateString() createdAt!: string;
}
