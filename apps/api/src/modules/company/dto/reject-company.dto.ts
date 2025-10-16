import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class RejectCompanyDto {
  @ApiProperty({ description: 'Rejection reason' })
  @IsString()
  @MaxLength(500)
  reason: string;
}
