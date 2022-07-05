import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Length } from 'class-validator';

export class SearchUserParamDto {
  @ApiProperty({
    enum: ['uplay', 'psn', 'xbl'],
    description: 'Platform to search',
  })
  @IsIn(['uplay', 'psn', 'xbl'])
  platform: 'uplay' | 'psn' | 'xbl';

  @ApiProperty({ type: 'string', description: 'Username to search' })
  @IsString()
  @Length(2, 255)
  query: string;
}
