import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { CreateClanDto } from './create-clan.dto';
import { CreateAliasDto } from './create-alias.dto';

export class CreateCheaterDto {
  @ApiProperty({
    type: 'string',
    description: 'Cheater name',
    example: 'hayabusa',
  })
  @IsString()
  @Length(5, 30)
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Cheater description',
    example: 'gasato play with him',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(2, 255)
  description: string;

  @ApiProperty({ type: [CreateClanDto] })
  @ValidateNested({ each: true })
  @IsOptional()
  clans?: CreateClanDto[];

  @ApiProperty({ type: [CreateAliasDto] })
  @ValidateNested({ each: true })
  @IsOptional()
  aliases?: CreateAliasDto[];
}
