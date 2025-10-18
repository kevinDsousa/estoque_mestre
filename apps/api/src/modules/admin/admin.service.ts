import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { ApproveCompanyDto, RejectCompanyDto, SuspendCompanyDto, CompanyQueryDto } from './dto/admin-company.dto';
import { CreateBusinessMetricDto, BusinessMetricQueryDto, GlobalMetricsDto } from './dto/admin-metrics.dto';
import { CreateAdminUserDto, UpdateAdminUserDto, AdminUserQueryDto } from './dto/admin-user.dto';
import { CompanyStatus, UserRole, UserStatus, BusinessMetricType } from '@prisma/client';
import { MetricPeriod } from './dto/admin-metrics.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // ===== COMPANY MANAGEMENT =====

  async getAllCompanies(query: CompanyQueryDto) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    } else if (!filters.includeInactive) {
      where.status = { not: CompanyStatus.REJECTED };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { cnpj: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              products: true,
              transactions: true,
            },
          },
          subscription: {
            include: {
              plan: {
                select: { name: true, monthlyPrice: true },
              },
            },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCompanyById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
            currentStock: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        transactions: {
          select: {
            id: true,
            type: true,
            discount: true,
            tax: true,
            shippingCost: true,
            status: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
        _count: {
          select: {
            users: true,
            products: true,
            transactions: true,
            suppliers: true,
            customers: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async approveCompany(id: string, approveDto: ApproveCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.status === CompanyStatus.APPROVED) {
      throw new BadRequestException('Company is already approved');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        status: CompanyStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: approveDto.approvedBy,
        approvalReason: approveDto.reason,
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    // Send approval email
    await this.emailService.sendCompanyApproval({
      companyName: company.name,
      email: company.email,
      status: 'approved',
      adminName: 'Administrador',
    });

    return updatedCompany;
  }

  async rejectCompany(id: string, rejectDto: RejectCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.status === CompanyStatus.REJECTED) {
      throw new BadRequestException('Company is already rejected');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        status: CompanyStatus.REJECTED,
        rejectedAt: new Date(),
        rejectedBy: rejectDto.rejectedBy,
        rejectionReason: rejectDto.reason,
      },
    });

    // Send rejection email
    await this.emailService.sendCompanyApproval({
      companyName: company.name,
      email: company.email,
      status: 'rejected',
      reason: rejectDto.reason,
      adminName: 'Administrador',
    });

    return updatedCompany;
  }

  async suspendCompany(id: string, suspendDto: SuspendCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.status === CompanyStatus.SUSPENDED) {
      throw new BadRequestException('Company is already suspended');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        status: CompanyStatus.SUSPENDED,
        suspendedAt: new Date(),
        suspendedBy: suspendDto.suspendedBy,
        suspensionReason: suspendDto.reason,
        suspensionEndDate: suspendDto.suspensionEndDate ? new Date(suspendDto.suspensionEndDate) : null,
      },
    });

    return updatedCompany;
  }

  async reactivateCompany(id: string, adminId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.status === CompanyStatus.APPROVED) {
      throw new BadRequestException('Company is already active');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        status: CompanyStatus.APPROVED,
        suspendedAt: null,
        suspendedBy: null,
        suspensionReason: null,
        suspensionEndDate: null,
        reactivatedAt: new Date(),
        reactivatedBy: adminId,
      },
    });

    return updatedCompany;
  }

  // ===== ADMIN USER MANAGEMENT =====

  async createAdminUser(createAdminDto: CreateAdminUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    const adminUser = await this.prisma.user.create({
      data: {
        email: createAdminDto.email,
        firstName: createAdminDto.firstName,
        lastName: createAdminDto.lastName,
        password: hashedPassword,
        role: createAdminDto.role,
        phone: createAdminDto.phone,
        status: UserStatus.ACTIVE,
        emailVerified: true, // Admin users are pre-verified
        companyId: null, // Admin users don't belong to a company
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return adminUser;
  }

  async getAllAdminUsers(query: AdminUserQueryDto) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    // Build where clause for admin users (no companyId)
    const where: any = { companyId: null };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    } else if (!filters.includeInactive) {
      where.status = UserStatus.ACTIVE;
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminUserById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    return user;
  }

  async updateAdminUser(id: string, updateAdminDto: UpdateAdminUserDto) {
    const user = await this.getAdminUserById(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateAdminDto,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async deleteAdminUser(id: string) {
    const user = await this.getAdminUserById(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Admin user deleted successfully' };
  }

  // ===== BUSINESS METRICS =====

  async createBusinessMetric(createMetricDto: CreateBusinessMetricDto, companyId?: string) {
    const metric = await this.prisma.businessMetric.create({
      data: {
        companyId: companyId || 'system', // System-wide metrics
        type: createMetricDto.type,
        period: createMetricDto.period,
        periodStart: new Date(createMetricDto.periodStart),
        periodEnd: new Date(createMetricDto.periodEnd),
        value: createMetricDto.value,
        metadata: createMetricDto.metadata,
        calculatedAt: new Date(),
      },
    });

    return metric;
  }

  async getBusinessMetrics(query: BusinessMetricQueryDto) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.period) {
      where.period = filters.period;
    }

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.startDate || filters.endDate) {
      where.periodStart = {};
      if (filters.startDate) {
        where.periodStart.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.periodStart.lte = new Date(filters.endDate);
      }
    }

    const [metrics, total] = await Promise.all([
      this.prisma.businessMetric.findMany({
        where,
        skip,
        take: limit,
        orderBy: { periodStart: 'desc' },
        include: {
          company: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.businessMetric.count({ where }),
    ]);

    return {
      data: metrics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ===== GLOBAL METRICS =====

  async getGlobalMetrics(): Promise<GlobalMetricsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      suspendedCompanies,
      totalUsers,
      activeUsers,
      totalProducts,
      totalTransactions,
      totalRevenue,
      storageUsage,
      apiCalls,
    ] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({ where: { status: CompanyStatus.APPROVED } }),
      this.prisma.company.count({ where: { status: CompanyStatus.PENDING } }),
      this.prisma.company.count({ where: { status: CompanyStatus.SUSPENDED } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.product.count(),
      this.prisma.transaction.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          type: 'SALE',
          status: 'COMPLETED' as any,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { discount: true, tax: true, shippingCost: true },
      }),
      // Storage usage would need to be calculated from MinIO or file system
      0, // Placeholder
      // API calls would need to be tracked separately
      0, // Placeholder
    ]);

    return {
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      suspendedCompanies,
      totalUsers,
      activeUsers,
      totalProducts,
      totalTransactions,
      totalRevenue: (totalRevenue._sum?.discount || 0) + (totalRevenue._sum?.tax || 0) + (totalRevenue._sum?.shippingCost || 0),
      storageUsage,
      apiCalls,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      },
    };
  }

  // ===== SYSTEM HEALTH =====

  async getSystemHealth() {
    const [
      databaseStatus,
      emailStatus,
      storageStatus,
      recentErrors,
    ] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkEmailHealth(),
      this.checkStorageHealth(),
      this.getRecentErrors(),
    ]);

    return {
      database: databaseStatus,
      email: emailStatus,
      storage: storageStatus,
      recentErrors,
      overallStatus: this.calculateOverallStatus(databaseStatus, emailStatus, storageStatus),
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabaseHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', message: 'Database connection successful' };
    } catch (error) {
      return { status: 'unhealthy', message: 'Database connection failed', error: error.message };
    }
  }

  private async checkEmailHealth() {
    // This would check if email service is configured and working
    // For now, return a basic status
    return { status: 'healthy', message: 'Email service configured' };
  }

  private async checkStorageHealth() {
    // This would check MinIO or file system health
    // For now, return a basic status
    return { status: 'healthy', message: 'Storage service available' };
  }

  private async getRecentErrors() {
    // TODO: Implement when ErrorLog model is available
    // const recentErrors = await this.prisma.errorLog.findMany({
    //   take: 10,
    //   orderBy: { createdAt: 'desc' },
    //   select: {
    //     id: true,
    //     level: true,
    //     message: true,
    //     createdAt: true,
    //   },
    // });

    return []; // Placeholder
  }

  private calculateOverallStatus(database: any, email: any, storage: any): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = [database.status, email.status, storage.status];
    const unhealthyCount = statuses.filter(status => status === 'unhealthy').length;
    const degradedCount = statuses.filter(status => status === 'degraded').length;

    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  }
}
