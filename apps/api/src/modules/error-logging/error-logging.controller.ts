import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ErrorLoggingService } from './error-logging.service';
import { CreateErrorLogDto } from './dto/create-error-log.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('error-logs')
@ApiTags('error-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ErrorLoggingController {
  constructor(private readonly errorLoggingService: ErrorLoggingService) {}

  @Post()
  @ApiOperation({ summary: 'Log a new error' })
  @ApiResponse({ status: 201, description: 'Error logged successfully' })
  async logError(@Body() createErrorLogDto: CreateErrorLogDto) {
    return this.errorLoggingService.logError(createErrorLogDto);
  }

  @Post('frontend')
  @ApiOperation({ summary: 'Log frontend error' })
  @ApiResponse({ status: 201, description: 'Frontend error logged successfully' })
  async logFrontendError(
    @Body() body: {
      userId: string;
      companyId: string;
      error: any;
      userAgent?: string;
      url?: string;
    },
  ) {
    return this.errorLoggingService.logFrontendError(
      body.userId,
      body.companyId,
      body.error,
      body.userAgent,
      body.url,
    );
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get errors by company' })
  @ApiResponse({ status: 200, description: 'List of errors for the company' })
  async getErrorsByCompany(
    @Param('companyId') companyId: string,
    @Query('limit') limit?: number,
  ) {
    return this.errorLoggingService.getErrorsByCompany(companyId, limit);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get errors by user' })
  @ApiResponse({ status: 200, description: 'List of errors for the user' })
  async getErrorsByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.errorLoggingService.getErrorsByUser(userId, limit);
  }

  @Get('stats/:companyId')
  @ApiOperation({ summary: 'Get error statistics for company' })
  @ApiResponse({ status: 200, description: 'Error statistics' })
  async getErrorStats(
    @Param('companyId') companyId: string,
    @Query('days') days?: number,
  ) {
    return this.errorLoggingService.getErrorStats(companyId, days);
  }
}
