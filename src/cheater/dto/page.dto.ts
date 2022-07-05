import { IsNumberString, IsOptional } from 'class-validator';

export class PageDto {
  @IsOptional()
  @IsNumberString()
  number = '1';

  @IsOptional()
  @IsNumberString()
  size = '10';
}
