import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Clan } from './clan.entity';
import { Alias } from './alias.entity';

@Entity({ name: 'cheaters' })
export class Cheater {
  @ApiProperty({ type: 'string', description: 'Auto generated uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: 'string', description: 'Cheater name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ type: 'string', description: 'Cheater description' })
  @Column({ default: null })
  description: string;

  @ApiProperty({
    type: 'boolean',
    description: 'Cheater confirmed status',
    default: false,
  })
  @Column({ default: false })
  confirmed: boolean;

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

  @ApiProperty({ type: () => [Alias] })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((type) => Alias, (alias) => alias.cheater, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  aliases: Alias[];

  @ApiProperty({ type: () => [Clan] })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((type) => Clan, (clans) => clans.cheater, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  clans: Clan[];
}
