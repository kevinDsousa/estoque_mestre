import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsArray, IsString } from 'class-validator';

class ChannelPrefs {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  frequency?: string;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ type: ChannelPrefs })
  @IsOptional()
  email?: ChannelPrefs;

  @ApiPropertyOptional({ type: ChannelPrefs })
  @IsOptional()
  push?: ChannelPrefs;

  @ApiPropertyOptional({ type: ChannelPrefs })
  @IsOptional()
  inApp?: ChannelPrefs;
}


