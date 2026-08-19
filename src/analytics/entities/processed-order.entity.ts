import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('processed_orders')
@Unique(['orderId', 'eventType'])
export class ProcessedOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderId!: number;

  @Column({ type: 'varchar' })
  eventType!: string;
}
