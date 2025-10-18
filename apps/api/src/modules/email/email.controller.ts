import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../company/guards/admin.guard';

@ApiTags('email')
@Controller('email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('test-connection')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Test email connection' })
  @ApiResponse({ status: 200, description: 'Email connection test result' })
  async testConnection() {
    const isConnected = await this.emailService.testEmailConnection();
    return {
      connected: isConnected,
      message: isConnected ? 'Email service is working' : 'Email service is not configured or not working',
    };
  }

  @Post('send-test')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  async sendTestEmail(@Body() body: { email: string; name: string }) {
    const success = await this.emailService.sendEmailVerification({
      name: body.name,
      email: body.email,
      verificationLink: 'https://example.com/verify?token=test-token',
      companyName: 'Test Company',
    });

    return {
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email',
    };
  }
}

