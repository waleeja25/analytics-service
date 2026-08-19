import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('daily_order_stats')
export class DailyOrderStat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date', unique: true })
  date!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRevenue!: number;
}
