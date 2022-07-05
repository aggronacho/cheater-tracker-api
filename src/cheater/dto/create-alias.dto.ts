import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateAliasDto {
  @ApiProperty({
    type: 'string',
    description: 'Cheater nickname',
    example: 'hayabusa 2',
  })
  @IsString()
  @Length(2, 255)
  name: string;
}
