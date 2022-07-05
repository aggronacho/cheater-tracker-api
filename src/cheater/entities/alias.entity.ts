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

@Entity({ name: 'aliases' })
export class Alias {
  @ApiProperty({ type: 'string', description: 'Auto generated uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string', description: 'Cheater nickname' })
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
  @ManyToOne((type) => Cheater, (cheater) => cheater.aliases, {
    onDelete: 'CASCADE',
  })
  cheater: Cheater[];
}
