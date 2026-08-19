import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('processed_orders')
export class ProcessedOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  orderId!: number;
}
