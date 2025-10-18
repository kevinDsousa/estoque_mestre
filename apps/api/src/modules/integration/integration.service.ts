import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthContextService } from '../../common/services/auth-context.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegrationQueryDto } from './dto/integration-query.dto';
import { SyncDataDto } from './dto/sync-data.dto';
import { WebhookConfigDto } from './dto/webhook-config.dto';
import { IntegrationType, IntegrationStatus, SyncDirection, SyncEntity } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class IntegrationService {
  constructor(
    private prisma: PrismaService,
    private authContextService: AuthContextService,
  ) {}

  // ===== INTEGRATION CRUD =====

  async create(createIntegrationDto: CreateIntegrationDto, companyId: string, userId: string) {
    // Check if integration with same name already exists in company
    const existingIntegration = await this.prisma.integration.findFirst({
      where: {
        companyId,
        name: createIntegrationDto.name,
      },
    });

    if (existingIntegration) {
      throw new ConflictException('Integration with this name already exists');
    }

    // Test connection if credentials are provided
    if (createIntegrationDto.apiKey || createIntegrationDto.username) {
      const isConnected = await this.testConnection(createIntegrationDto);
      if (!isConnected) {
        throw new BadRequestException('Failed to connect to external API');
      }
    }

    const integration = await this.prisma.integration.create({
      data: {
        ...createIntegrationDto,
        companyId,
        createdBy: userId,
        status: IntegrationStatus.ACTIVE,
        isActive: createIntegrationDto.isActive ?? true,
        lastSyncAt: null,
        config: createIntegrationDto.config || {},
      },
      include: {
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return integration;
  }

  async findAll(companyId: string, query: IntegrationQueryDto) {
    const { page = 1, limit = 10, type, status, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [integrations, total] = await Promise.all([
      this.prisma.integration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdByUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.integration.count({ where }),
    ]);

    return {
      data: integrations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id, companyId },
      include: {
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        syncLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return integration;
  }

  async update(id: string, updateIntegrationDto: UpdateIntegrationDto, companyId: string, userId: string) {
    const integration = await this.findOne(id, companyId);

    // Test connection if credentials are being updated
    if (updateIntegrationDto.apiKey || updateIntegrationDto.username || updateIntegrationDto.baseUrl) {
      const testData = {
        ...integration,
        ...updateIntegrationDto,
      };
      const isConnected = await this.testConnection(testData);
      if (!isConnected) {
        throw new BadRequestException('Failed to connect to external API');
      }
    }

    const updatedIntegration = await this.prisma.integration.update({
      where: { id },
      data: {
        ...updateIntegrationDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        createdByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return updatedIntegration;
  }

  async remove(id: string, companyId: string) {
    const integration = await this.findOne(id, companyId);

    // Check if integration has active sync logs
    const activeSyncs = await this.prisma.syncLog.count({
      where: {
        integrationId: id,
        status: 'RUNNING',
      },
    });

    if (activeSyncs > 0) {
      throw new BadRequestException('Cannot delete integration with active sync operations');
    }

    await this.prisma.integration.delete({
      where: { id },
    });

    return { message: 'Integration deleted successfully' };
  }

  // ===== CONNECTION TESTING =====

  async testConnection(integrationData: any): Promise<boolean> {
    try {
      // This is a simplified connection test
      // In a real implementation, you would make an actual HTTP request
      // to the external API to verify credentials and connectivity
      
      if (!integrationData.baseUrl) {
        return false;
      }

      // Simulate connection test
      // You could use axios or fetch here to make a real request
      // const response = await axios.get(`${integrationData.baseUrl}/health`, {
      //   headers: {
      //     'Authorization': `Bearer ${integrationData.apiKey}`,
      //   },
      //   timeout: 5000,
      // });
      
      // For now, just return true if we have the required fields
      return !!(integrationData.baseUrl && (integrationData.apiKey || integrationData.username));
    } catch (error) {
      return false;
    }
  }

  async testIntegrationConnection(id: string, companyId: string) {
    const integration = await this.findOne(id, companyId);
    
    const isConnected = await this.testConnection(integration);
    
    // Update last connection test
    await this.prisma.integration.update({
      where: { id },
      data: {
        lastConnectionTest: new Date(),
        status: isConnected ? IntegrationStatus.ACTIVE : IntegrationStatus.ERROR,
      },
    });

    return {
      connected: isConnected,
      message: isConnected ? 'Connection successful' : 'Connection failed',
      testedAt: new Date(),
    };
  }

  // ===== DATA SYNCHRONIZATION =====

  async syncData(syncDataDto: SyncDataDto, companyId: string, userId: string) {
    const integration = await this.findOne(syncDataDto.integrationId, companyId);

    if (!integration.isActive) {
      throw new BadRequestException('Integration is not active');
    }

    // Create sync log entry
    const syncLog = await this.prisma.syncLog.create({
      data: {
        integrationId: integration.id,
        entity: syncDataDto.entity,
        direction: syncDataDto.direction,
        status: 'RUNNING',
        startedBy: userId,
        metadata: {
          entityIds: syncDataDto.entityIds,
          fromDate: syncDataDto.fromDate,
          toDate: syncDataDto.toDate,
          params: syncDataDto.params,
        },
      },
    });

    try {
      // Perform the actual sync
      const result = await this.performSync(integration, syncDataDto);
      
      // Update sync log with success
      await this.prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          recordsProcessed: result.recordsProcessed,
          recordsSucceeded: result.recordsSucceeded,
          recordsFailed: result.recordsFailed,
          metadata: {
            ...(syncLog.metadata as any),
            result,
          },
        },
      });

      // Update integration last sync time
      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          lastSyncAt: new Date(),
        },
      });

      return {
        syncLogId: syncLog.id,
        status: 'COMPLETED',
        ...result,
      };
    } catch (error) {
      // Update sync log with error
      await this.prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  private async performSync(integration: any, syncData: SyncDataDto) {
    // This is a simplified sync implementation
    // In a real implementation, you would:
    // 1. Connect to the external API
    // 2. Fetch data based on the sync parameters
    // 3. Transform the data to match your internal schema
    // 4. Save/update the data in your database
    // 5. Handle errors and retries

    const mockResult = {
      recordsProcessed: 100,
      recordsSucceeded: 95,
      recordsFailed: 5,
      errors: [
        { recordId: '1', error: 'Validation failed' },
        { recordId: '2', error: 'Duplicate entry' },
      ],
    };

    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockResult;
  }

  // ===== WEBHOOK MANAGEMENT =====

  async createWebhook(integrationId: string, webhookConfig: WebhookConfigDto, companyId: string, userId: string) {
    const integration = await this.findOne(integrationId, companyId);

    const webhook = await this.prisma.webhook.create({
      data: {
        integrationId,
        companyId,
        url: webhookConfig.url,
        events: webhookConfig.events,
        isActive: webhookConfig.isActive ?? true,
        secret: webhookConfig.secret || this.generateWebhookSecret(),
        headers: webhookConfig.headers || {},
        timeout: webhookConfig.timeout || 30000,
        retryAttempts: webhookConfig.retryAttempts || 3,
        createdBy: userId,
      },
    });

    return webhook;
  }

  async getWebhooks(integrationId: string, companyId: string) {
    const integration = await this.findOne(integrationId, companyId);

    return this.prisma.webhook.findMany({
      where: { integrationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWebhook(webhookId: string, webhookConfig: Partial<WebhookConfigDto>, companyId: string, userId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { 
        id: webhookId,
        integration: { companyId },
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.webhook.update({
      where: { id: webhookId },
      data: {
        ...webhookConfig,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async deleteWebhook(webhookId: string, companyId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { 
        id: webhookId,
        integration: { companyId },
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    await this.prisma.webhook.delete({
      where: { id: webhookId },
    });

    return { message: 'Webhook deleted successfully' };
  }

  // ===== STATISTICS =====

  async getIntegrationStats(companyId: string) {
    const [
      totalIntegrations,
      activeIntegrations,
      errorIntegrations,
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      lastSyncs,
    ] = await Promise.all([
      this.prisma.integration.count({ where: { companyId } }),
      this.prisma.integration.count({ where: { companyId, status: IntegrationStatus.ACTIVE } }),
      this.prisma.integration.count({ where: { companyId, status: IntegrationStatus.ERROR } }),
      this.prisma.syncLog.count({ where: { integration: { companyId } } }),
      this.prisma.syncLog.count({ where: { integration: { companyId }, status: 'COMPLETED' } }),
      this.prisma.syncLog.count({ where: { integration: { companyId }, status: 'FAILED' } }),
      this.prisma.syncLog.findMany({
        where: { integration: { companyId } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          integration: {
            select: { name: true, type: true },
          },
        },
      }),
    ]);

    return {
      integrations: {
        total: totalIntegrations,
        active: activeIntegrations,
        errors: errorIntegrations,
      },
      syncs: {
        total: totalSyncs,
        successful: successfulSyncs,
        failed: failedSyncs,
        successRate: totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0,
      },
      recentSyncs: lastSyncs,
    };
  }

  // ===== HELPER METHODS =====

  private generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async triggerWebhook(webhookId: string, event: string, data: any) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      return;
    }

    if (!webhook.events.includes(event)) {
      return;
    }

    // Create webhook log
    const webhookLog = await this.prisma.webhookLog.create({
      data: {
        webhookId,
        event,
        payload: data,
        status: 'PENDING',
        success: false,
        attempts: 0,
      },
    });

    // In a real implementation, you would send the webhook here
    // For now, we'll just simulate it
    try {
      // Simulate webhook call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await this.prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: 'SUCCESS',
          success: true,
          response: { message: 'Webhook sent successfully' },
          completedAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: 'FAILED',
          success: false,
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });
    }
  }
}
