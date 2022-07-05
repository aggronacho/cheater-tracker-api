import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreateClanDto {
  @ApiProperty({ type: 'string', description: 'Clan tag', example: 'SMP' })
  @IsString()
  @Matches(/[a-zA-Z]{3}/)
  @Length(3, 3)
  tag: string;

  @ApiProperty({ type: 'string', description: 'Clan name', example: 'sample' })
  @IsString()
  @Length(2, 255)
  name: string;
}
