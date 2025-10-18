import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { IntegrationService } from './integration.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegrationQueryDto } from './dto/integration-query.dto';
import { SyncDataDto } from './dto/sync-data.dto';
import { WebhookConfigDto } from './dto/webhook-config.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../../common/guards/role.guard';
import { UserRole } from '@prisma/client';
import { AuthContext } from '../../common/decorators/auth-context.decorator';

@ApiTags('integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  // ===== INTEGRATION CRUD =====

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new integration' })
  @ApiResponse({ status: 201, description: 'Integration created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Integration with this name already exists' })
  async create(
    @Body() createIntegrationDto: CreateIntegrationDto,
    @AuthContext() authContext: any,
  ) {
    return this.integrationService.create(
      createIntegrationDto,
      authContext.companyId,
      authContext.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all integrations with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Integrations retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by integration type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or description' })
  async findAll(
    @AuthContext() authContext: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ) {
    const query: IntegrationQueryDto = {
      page,
      limit,
      type: type as any,
      status: status as any,
      isActive,
      search,
    };

    return this.integrationService.findAll(authContext.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get integration statistics' })
  @ApiResponse({ status: 200, description: 'Integration statistics retrieved successfully' })
  async getStats(@AuthContext() authContext: any) {
    return this.integrationService.getIntegrationStats(authContext.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by ID' })
  @ApiResponse({ status: 200, description: 'Integration retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  async findOne(
    @Param('id') id: string,
    @AuthContext() authContext: any,
  ) {
    return this.integrationService.findOne(id, authContext.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update integration' })
  @ApiResponse({ status: 200, description: 'Integration updated successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  async update(
    @Param('id') id: string,
    @Body() updateIntegrationDto: UpdateIntegrationDto,
    @AuthContext() authContext: any,
  ) {
    return this.integrationService.update(
      id,
      updateIntegrationDto,
      authContext.companyId,
      authContext.userId,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete integration' })
  @ApiResponse({ status: 200, description: 'Integration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete integration with active sync operations' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  async remove(
    @Param('id') id: string,
    @AuthContext() authContext: any,
  ) {
    return this.integrationService.remove(id, authContext.companyId);
  }

  // ===== CONNECTION TESTING =====

  @Post(':id/test-connection')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  async testConnection(
    @Param('id') id: string,
    @AuthContext() authContext: any,
  ) {
    return this.integrationService.testIntegrationConnection(id, authContext.companyId);
  }

  // ===== DATA SYNCHRONIZATION =====

  @Post('sync')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Sync data with external system' })
  @ApiResponse({ status: 200, description: 'Data sync initiated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async syncData(
    @Body() syncDataDto: SyncDataDto,
    @AuthContext() authContext: any,
  ) {
    return this.integrationService.syncData(
      syncDataDto,
      authContext.companyId,
      authContext.userId,
    );
  }

  // ===== WEBHOOK MANAGEMENT =====

  @Post(':id/webhooks')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create webhook for integration' })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  async createWebhook(
    @Param('id') integrationId: string,
    @Body() webhookConfig: WebhookConfigDto,
    @AuthContext() authContext: any,
  ) {
    return this.integrationService.createWebhook(
      integrationId,
      webhookConfig,
      authContext.companyId,
      authContext.userId,
    );
  }

  @Get(':id/webhooks')
  @ApiOperation({ summary: 'Get webhooks for integration' })
  @ApiResponse({ status: 200, description: 'Webhooks retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  async getWebhooks(
    @Param('id') integrationId: string,
    @AuthContext() authContext: any,
  ) {
    return this.integrationService.getWebhooks(integrationId, authContext.companyId);
  }

  @Patch('webhooks/:webhookId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update webhook configuration' })
  @ApiResponse({ status: 200, description: 'Webhook updated successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiParam({ name: 'webhookId', description: 'Webhook ID' })
  async updateWebhook(
    @Param('webhookId') webhookId: string,
    @Body() webhookConfig: Partial<WebhookConfigDto>,
    @AuthContext() authContext: any,
  ) {
    return this.integrationService.updateWebhook(
      webhookId,
      webhookConfig,
      authContext.companyId,
      authContext.userId,
    );
  }

  @Delete('webhooks/:webhookId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete webhook' })
  @ApiResponse({ status: 200, description: 'Webhook deleted successfully' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiParam({ name: 'webhookId', description: 'Webhook ID' })
  async deleteWebhook(
    @Param('webhookId') webhookId: string,
    @AuthContext() authContext: any,
  ) {
    return this.integrationService.deleteWebhook(webhookId, authContext.companyId);
  }

  // ===== SYNC LOGS =====

  @Get(':id/sync-logs')
  @ApiOperation({ summary: 'Get sync logs for integration' })
  @ApiResponse({ status: 200, description: 'Sync logs retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getSyncLogs(
    @Param('id') integrationId: string,
    @AuthContext() authContext: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    // Verify integration exists and belongs to company
    await this.integrationService.findOne(integrationId, authContext.companyId);

    const skip = (page - 1) * limit;

    const [syncLogs, total] = await Promise.all([
      this.integrationService['prisma'].syncLog.findMany({
        where: { integrationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          startedByUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.integrationService['prisma'].syncLog.count({ where: { integrationId } }),
    ]);

    return {
      data: syncLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
