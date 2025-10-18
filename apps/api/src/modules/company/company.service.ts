import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyStatus } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    // Check if company with same document already exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { document: createCompanyDto.document },
    });

    if (existingCompany) {
      throw new ConflictException('Company with this document already exists');
    }

    // Check if company with same email already exists
    const existingEmail = await this.prisma.company.findFirst({
      where: { email: createCompanyDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Company with this email already exists');
    }

    const company = await this.prisma.company.create({
      data: {
        ...createCompanyDto,
        status: CompanyStatus.PENDING_APPROVAL,
        country: createCompanyDto.country || 'Brasil',
        lowStockThreshold: createCompanyDto.lowStockThreshold || 10,
        autoReorderEnabled: createCompanyDto.autoReorderEnabled || false,
        trackExpiration: createCompanyDto.trackExpiration || false,
      },
    });

    // Send verification email
    await this.emailService.sendEmailVerification({
      name: createCompanyDto.name,
      email: createCompanyDto.email,
      verificationLink: `${process.env.FRONTEND_URL}/verify-company?token=${company.id}`,
      companyName: createCompanyDto.name,
    });

    return company;
  }

  async findAll(page: number = 1, limit: number = 10, status?: CompanyStatus) {
    const skip = (page - 1) * limit;
    
    const where = status ? { status } : {};
    
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
            },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
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
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
            suppliers: true,
            customers: true,
            transactions: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(id);

    // Check if document is being changed and if it's unique
    if (updateCompanyDto.document && updateCompanyDto.document !== company.document) {
      const existingCompany = await this.prisma.company.findUnique({
        where: { document: updateCompanyDto.document },
      });

      if (existingCompany) {
        throw new ConflictException('Company with this document already exists');
      }
    }

    // Check if email is being changed and if it's unique
    if (updateCompanyDto.email && updateCompanyDto.email !== company.email) {
      const existingEmail = await this.prisma.company.findFirst({
        where: { email: updateCompanyDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Company with this email already exists');
      }
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async approve(id: string, adminId: string, reason?: string) {
    const company = await this.findOne(id);

    if (company.status !== CompanyStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Company is not pending approval');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        status: CompanyStatus.ACTIVE,
      },
    });

    // Send approval email
    await this.emailService.sendCompanyApproval({
      companyName: company.name,
      email: company.email,
      status: 'approved',
      adminName: 'Administrador',
    });

    // TODO: Create default subscription
    // await this.subscriptionService.createDefaultSubscription(id);

    return updatedCompany;
  }

  async reject(id: string, adminId: string, reason: string) {
    const company = await this.findOne(id);

    if (company.status !== CompanyStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Company is not pending approval');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        status: CompanyStatus.INACTIVE,
      },
    });

    // Send rejection email
    await this.emailService.sendCompanyApproval({
      companyName: company.name,
      email: company.email,
      status: 'rejected',
      reason,
      adminName: 'Administrador',
    });

    return updatedCompany;
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if company has users, products, etc.
    const companyData = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            suppliers: true,
            customers: true,
            transactions: true,
          },
        },
      },
    });

    if (!companyData) {
      throw new NotFoundException('Company not found');
    }

    if (companyData._count.users > 0) {
      throw new BadRequestException('Cannot delete company with users');
    }

    if (companyData._count.products > 0) {
      throw new BadRequestException('Cannot delete company with products');
    }

    return this.prisma.company.delete({
      where: { id },
    });
  }

  async getStats(id: string) {
    const company = await this.findOne(id);

    const [
      totalUsers,
      totalProducts,
      totalSuppliers,
      totalCustomers,
      totalTransactions,
      lowStockProducts,
    ] = await Promise.all([
      this.prisma.user.count({ where: { companyId: id } }),
      this.prisma.product.count({ where: { companyId: id } }),
      this.prisma.supplier.count({ where: { companyId: id } }),
      this.prisma.customer.count({ where: { companyId: id } }),
      this.prisma.transaction.count({ where: { companyId: id } }),
      this.prisma.product.count({
        where: {
          companyId: id,
          currentStock: { lte: this.prisma.product.fields.minStock },
        },
      }),
    ]);

    return {
      company: {
        id: company.id,
        name: company.name,
        status: company.status,
      },
      stats: {
        totalUsers,
        totalProducts,
        totalSuppliers,
        totalCustomers,
        totalTransactions,
        lowStockProducts,
      },
    };
  }
}
