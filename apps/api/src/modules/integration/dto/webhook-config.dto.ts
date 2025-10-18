import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject, IsBoolean, IsUrl } from 'class-validator';

export class WebhookConfigDto {
  @ApiProperty({ description: 'URL do webhook' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Eventos que o webhook deve escutar', example: ['product.created', 'product.updated'] })
  @IsArray()
  @IsString({ each: true })
  events: string[];

  @ApiPropertyOptional({ description: 'Se o webhook está ativo', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Secret para validação do webhook' })
  @IsOptional()
  @IsString()
  secret?: string;

  @ApiPropertyOptional({ description: 'Headers adicionais para o webhook' })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Timeout em milissegundos', example: 30000 })
  @IsOptional()
  timeout?: number = 30000;

  @ApiPropertyOptional({ description: 'Número máximo de tentativas em caso de falha', example: 3 })
  @IsOptional()
  retryAttempts?: number = 3;
}
