import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cheater } from './cheater.entity';

@Entity({ name: 'clans' })
export class Clan {
  @ApiProperty({ type: 'string', description: 'Auto generated uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string', description: 'Clan tag' })
  @Column({ length: 3 })
  tag: string;

  @ApiProperty({ type: 'string', description: 'Clan name' })
  @Column()
  name: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Cheater, (cheater) => cheater.clans, {
    onDelete: 'CASCADE',
  })
  cheater: Cheater[];
}
