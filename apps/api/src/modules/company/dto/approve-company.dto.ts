import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CompanyApproveDto {
  @ApiProperty({ description: 'Approval reason', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
