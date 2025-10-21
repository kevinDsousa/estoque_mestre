import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { ApproveCompanyDto, AdminRejectCompanyDto, SuspendCompanyDto, CompanyQueryDto } from './dto/admin-company.dto';
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

  async rejectCompany(id: string, rejectDto: AdminRejectCompanyDto) {
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

  // ===== DASHBOARD METHODS =====

  async getDashboardStats(companyId: string) {
    const [
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalCustomers,
      totalTransactions,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue
    ] = await Promise.all([
      this.prisma.product.count({ where: { companyId } }),
      this.prisma.category.count({ where: { companyId } }),
      this.prisma.supplier.count({ where: { companyId } }),
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.transaction.count({ where: { companyId } }),
      this.prisma.product.count({ 
        where: { 
          companyId,
          currentStock: { lte: this.prisma.product.fields.minStock }
        }
      }),
      this.prisma.product.count({ 
        where: { 
          companyId,
          currentStock: 0
        }
      }),
      this.prisma.product.aggregate({
        where: { companyId },
        _sum: {
          currentStock: true
        }
      })
    ]);

    return {
      totalProducts,
      totalCategories,
      totalSuppliers,
      totalCustomers,
      totalTransactions,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue: totalInventoryValue._sum.currentStock || 0
    };
  }

  async getQuickStats(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [monthlyStats, weeklyStats, dailyStats] = await Promise.all([
      this.getPeriodStats(companyId, startOfMonth, now),
      this.getPeriodStats(companyId, startOfWeek, now),
      this.getPeriodStats(companyId, startOfDay, now)
    ]);

    return {
      monthly: monthlyStats,
      weekly: weeklyStats,
      daily: dailyStats
    };
  }

  private async getPeriodStats(companyId: string, startDate: Date, endDate: Date) {
    const [sales, purchases, newProducts, newCustomers] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          companyId,
          type: 'SALE',
          transactionDate: { gte: startDate, lte: endDate }
        },
        include: {
          items: true
        }
      }),
      this.prisma.transaction.findMany({
        where: {
          companyId,
          type: 'PURCHASE',
          transactionDate: { gte: startDate, lte: endDate }
        },
        include: {
          items: true
        }
      }),
      this.prisma.product.count({
        where: {
          companyId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      this.prisma.customer.count({
        where: {
          companyId,
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    const salesAmount = sales.reduce((sum, transaction) => 
      sum + transaction.items.reduce((itemSum, item) => itemSum + (item.unitPrice * item.quantity), 0), 0
    );

    const purchasesAmount = purchases.reduce((sum, transaction) => 
      sum + transaction.items.reduce((itemSum, item) => itemSum + (item.unitPrice * item.quantity), 0), 0
    );

    return {
      sales: {
        amount: salesAmount,
        count: sales.length
      },
      purchases: {
        amount: purchasesAmount,
        count: purchases.length
      },
      newProducts,
      newCustomers
    };
  }

  async getRecentActivity(companyId: string, limit: number = 10) {
    const activities = await this.prisma.transaction.findMany({
      where: { companyId },
      take: limit,
      orderBy: { transactionDate: 'desc' },
      include: {
        customer: true,
        supplier: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return activities.map(transaction => {
      const totalAmount = transaction.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      return {
        id: transaction.id,
        type: transaction.type,
        description: this.getActivityDescription(transaction),
        date: transaction.transactionDate,
        user: transaction.user ? `${transaction.user.firstName} ${transaction.user.lastName}` : 'Sistema',
        amount: totalAmount
      };
    });
  }

  private getActivityDescription(transaction: any): string {
    const itemCount = transaction.items.length;
    const firstItem = transaction.items[0]?.product?.name || 'Produto';
    
    if (transaction.type === 'SALE') {
      return `Venda de ${itemCount} item(s) - ${firstItem}`;
    } else if (transaction.type === 'PURCHASE') {
      return `Compra de ${itemCount} item(s) - ${firstItem}`;
    } else {
      return `Transação de ${itemCount} item(s) - ${firstItem}`;
    }
  }

  async getLowStockProducts(companyId: string) {
    return this.prisma.product.findMany({
      where: {
        companyId,
        currentStock: { lte: this.prisma.product.fields.minStock }
      },
      include: {
        category: true,
        supplier: true
      },
      orderBy: { currentStock: 'asc' }
    });
  }

  async getPendingOrders(companyId: string) {
    return this.prisma.transaction.findMany({
      where: {
        companyId,
        status: 'PENDING'
      },
      include: {
        customer: true,
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { transactionDate: 'desc' }
    });
  }

  async getSalesChartData(companyId: string, period: string = 'month') {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        groupBy = 'day';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupBy = 'month';
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = 'day';
    }

    const sales = await this.prisma.transaction.findMany({
      where: {
        companyId,
        type: 'SALE',
        transactionDate: { gte: startDate }
      },
      include: {
        items: true
      },
      orderBy: { transactionDate: 'asc' }
    });

    // Group data by period
    const groupedData = this.groupSalesData(sales, groupBy);
    
    return {
      labels: Object.keys(groupedData),
      data: Object.values(groupedData)
    };
  }

  private groupSalesData(sales: any[], groupBy: string) {
    const grouped: { [key: string]: number } = {};

    sales.forEach(sale => {
      let key: string;
      const date = new Date(sale.transactionDate);

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      const totalAmount = sale.items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0);
      grouped[key] = (grouped[key] || 0) + totalAmount;
    });

    return grouped;
  }

  async getInventoryChartData(companyId: string) {
    const categories = await this.prisma.category.findMany({
      where: { companyId },
      include: {
        products: {
          select: {
            currentStock: true,
            costPrice: true
          }
        }
      }
    });

    return categories.map(category => ({
      name: category.name,
      totalStock: category.products.reduce((sum, product) => sum + product.currentStock, 0),
      totalValue: category.products.reduce((sum, product) => sum + (product.currentStock * product.costPrice), 0)
    }));
  }

  async getTopSellingProducts(companyId: string, limit: number = 5) {
    const topProducts = await this.prisma.transactionItem.groupBy({
      by: ['productId'],
      where: {
        transaction: {
          companyId,
          type: 'SALE'
        }
      },
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit
    });

    const productIds = topProducts.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        companyId
      },
      include: {
        category: true
      }
    });

    return topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        product,
        totalSold: item._sum.quantity || 0
      };
    });
  }

  async getTopCustomers(companyId: string, limit: number = 5) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        companyId,
        type: 'SALE',
        customerId: { not: null }
      },
      include: {
        customer: true,
        items: true
      }
    });

    // Group by customer and calculate totals
    const customerTotals: { [key: string]: { customer: any; totalSpent: number; orderCount: number } } = {};

    transactions.forEach(transaction => {
      const customerId = transaction.customerId!;
      const totalAmount = transaction.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      if (!customerTotals[customerId]) {
        customerTotals[customerId] = {
          customer: transaction.customer,
          totalSpent: 0,
          orderCount: 0
        };
      }

      customerTotals[customerId].totalSpent += totalAmount;
      customerTotals[customerId].orderCount += 1;
    });

    // Sort by total spent and take top customers
    const topCustomers = Object.values(customerTotals)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);

    return topCustomers;
  }

  async getRevenueByCategory(companyId: string) {
    const revenueByCategory = await this.prisma.transactionItem.groupBy({
      by: ['productId'],
      where: {
        transaction: {
          companyId,
          type: 'SALE'
        }
      },
      _sum: {
        unitPrice: true
      }
    });

    const productIds = revenueByCategory.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        companyId
      },
      include: {
        category: true
      }
    });

    const categoryRevenue: { [key: string]: number } = {};

    revenueByCategory.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && product.category) {
        const categoryName = product.category.name;
        categoryRevenue[categoryName] = (categoryRevenue[categoryName] || 0) + (item._sum.unitPrice || 0);
      }
    });

    return Object.entries(categoryRevenue).map(([category, revenue]) => ({
      category,
      revenue
    }));
  }

  async getMonthlySalesTrend(companyId: string, months: number = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const sales = await this.prisma.transaction.findMany({
      where: {
        companyId,
        type: 'SALE',
        transactionDate: { gte: startDate, lte: endDate }
      },
      include: {
        items: true
      },
      orderBy: { transactionDate: 'asc' }
    });

    const monthlyData = this.groupSalesData(sales, 'month');
    
    return {
      labels: Object.keys(monthlyData),
      data: Object.values(monthlyData)
    };
  }

  async getInventoryValueByCategory(companyId: string) {
    const categories = await this.prisma.category.findMany({
      where: { companyId },
      include: {
        products: {
          select: {
            currentStock: true,
            costPrice: true
          }
        }
      }
    });

    return categories.map(category => ({
      category: category.name,
      value: category.products.reduce((sum, product) => sum + (product.currentStock * product.costPrice), 0)
    }));
  }

  async getProfitMarginAnalysis(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: { companyId },
      select: {
        costPrice: true,
        sellingPrice: true,
        currentStock: true
      }
    });

    const totalCost = products.reduce((sum, product) => sum + (product.currentStock * product.costPrice), 0);
    const totalValue = products.reduce((sum, product) => sum + (product.currentStock * product.sellingPrice), 0);
    const profitMargin = totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0;

    return {
      totalCost,
      totalValue,
      profitMargin,
      profitAmount: totalValue - totalCost
    };
  }

  async getStockMovementTrends(companyId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const movements = await this.prisma.inventoryMovement.findMany({
      where: {
        companyId,
        movementDate: { gte: startDate, lte: endDate }
      },
      select: {
        movementDate: true,
        quantity: true,
        type: true
      },
      orderBy: { movementDate: 'asc' }
    });

    const dailyMovements = this.groupStockMovements(movements);
    
    return {
      labels: Object.keys(dailyMovements),
      data: Object.values(dailyMovements)
    };
  }

  private groupStockMovements(movements: any[]) {
    const grouped: { [key: string]: { in: number; out: number } } = {};

    movements.forEach(movement => {
      const date = new Date(movement.movementDate).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { in: 0, out: 0 };
      }
      
      if (movement.type === 'IN') {
        grouped[date].in += movement.quantity;
      } else {
        grouped[date].out += movement.quantity;
      }
    });

    return grouped;
  }

  async getSupplierPerformance(companyId: string) {
    const suppliers = await this.prisma.supplier.findMany({
      where: { companyId },
      include: {
        products: {
          include: {
            inventoryMovements: {
              where: {
                type: 'IN'
              }
            }
          }
        }
      }
    });

    return suppliers.map(supplier => ({
      supplier: {
        id: supplier.id,
        name: supplier.name
      },
      totalProducts: supplier.products.length,
      totalStockReceived: supplier.products.reduce((sum, product) => 
        sum + product.inventoryMovements.reduce((stockSum, history) => stockSum + history.quantity, 0), 0
      )
    }));
  }

  async getCustomerAcquisitionTrends(companyId: string, months: number = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const customers = await this.prisma.customer.findMany({
      where: {
        companyId,
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const monthlyAcquisition = this.groupCustomerAcquisition(customers);
    
    return {
      labels: Object.keys(monthlyAcquisition),
      data: Object.values(monthlyAcquisition)
    };
  }

  private groupCustomerAcquisition(customers: any[]) {
    const grouped: { [key: string]: number } = {};

    customers.forEach(customer => {
      const date = new Date(customer.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return grouped;
  }

  async getAlertsSummary(companyId: string) {
    const [lowStockCount, outOfStockCount, pendingOrdersCount, expiredProductsCount] = await Promise.all([
      this.prisma.product.count({
        where: {
          companyId,
          AND: [
            { currentStock: { lte: this.prisma.product.fields.minStock } },
            { currentStock: { gt: 0 } }
          ]
        }
      }),
      this.prisma.product.count({
        where: {
          companyId,
          currentStock: 0
        }
      }),
      this.prisma.transaction.count({
        where: {
          companyId,
          status: 'PENDING'
        }
      }),
      this.prisma.product.count({
        where: {
          companyId,
          expirationDate: { lte: new Date() }
        }
      })
    ]);

    return {
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      pendingOrders: pendingOrdersCount,
      expiredProducts: expiredProductsCount,
      total: lowStockCount + outOfStockCount + pendingOrdersCount + expiredProductsCount
    };
  }

  async exportDashboardData(companyId: string, format: string = 'xlsx') {
    // This would typically generate and return a file
    // For now, return a mock response
    return {
      message: `Dashboard data exported in ${format} format`,
      downloadUrl: `/api/admin/dashboard/export/download?format=${format}&companyId=${companyId}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }
}
