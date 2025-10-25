import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerContactDto } from './dto/customer-contact.dto';
import { CustomerStatus } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, companyId: string) {
    // Check if customer with same document already exists in company
    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        document: createCustomerDto.document,
        companyId,
      },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this document already exists in your company');
    }

    // Prepare contacts and addresses as JSON
    const contacts = [
      {
        name: createCustomerDto.contactPerson || createCustomerDto.name,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        secondaryPhone: createCustomerDto.secondaryPhone,
        isPrimary: true,
      },
    ];

    const addresses = [
      {
        type: 'MAIN',
        street: createCustomerDto.street,
        number: createCustomerDto.number,
        complement: createCustomerDto.complement,
        neighborhood: createCustomerDto.neighborhood,
        city: createCustomerDto.city,
        state: createCustomerDto.state,
        zipCode: createCustomerDto.zipCode,
        country: createCustomerDto.country || 'Brasil',
        isPrimary: true,
      },
    ];

    const customer = await this.prisma.customer.create({
      data: {
        name: createCustomerDto.name,
        legalName: createCustomerDto.legalName,
        document: createCustomerDto.document,
        type: createCustomerDto.type,
        status: createCustomerDto.status || CustomerStatus.ACTIVE,
        contacts,
        addresses,
        website: createCustomerDto.website,
        description: createCustomerDto.description,
        creditLimit: createCustomerDto.creditLimit,
        paymentTerms: createCustomerDto.paymentTerms || 30,
        isVip: createCustomerDto.isVip || false,
        birthDate: createCustomerDto.birthDate,
        notes: createCustomerDto.notes,
        companyId,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    return customer;
  }

  async findAll(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    status?: CustomerStatus,
    type?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = { 
      companyId,
      deletedAt: null // Exclude soft-deleted records
    };
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { 
        id, 
        companyId,
        deletedAt: null // Exclude soft-deleted records
      },
      include: {
        transactions: {
          select: {
            id: true,
            type: true,
            status: true,
            transactionDate: true,
          },
          orderBy: { transactionDate: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, companyId: string) {
    const customer = await this.findOne(id, companyId);

    // Check if document is being changed and if it's unique
    if (updateCustomerDto.document && updateCustomerDto.document !== customer.document) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: {
          document: updateCustomerDto.document,
          companyId,
          id: { not: id },
        },
      });

      if (existingCustomer) {
        throw new ConflictException('Customer with this document already exists in your company');
      }
    }

    // Prepare update data
    const updateData: any = {
      name: updateCustomerDto.name,
      legalName: updateCustomerDto.legalName,
      document: updateCustomerDto.document,
      type: updateCustomerDto.type,
      status: updateCustomerDto.status,
      website: updateCustomerDto.website,
      description: updateCustomerDto.description,
      creditLimit: updateCustomerDto.creditLimit,
      paymentTerms: updateCustomerDto.paymentTerms,
      isVip: updateCustomerDto.isVip,
      birthDate: updateCustomerDto.birthDate,
      notes: updateCustomerDto.notes,
    };

    // Update contacts if provided
    if (updateCustomerDto.email || updateCustomerDto.phone || updateCustomerDto.contactPerson) {
      const currentContacts = customer.contacts as any[];
      const updatedContacts = currentContacts.map(contact => {
        if (contact.isPrimary) {
          return {
            ...contact,
            name: updateCustomerDto.contactPerson || contact.name,
            email: updateCustomerDto.email || contact.email,
            phone: updateCustomerDto.phone || contact.phone,
            secondaryPhone: updateCustomerDto.secondaryPhone || contact.secondaryPhone,
          };
        }
        return contact;
      });
      updateData.contacts = updatedContacts;
    }

    // Update addresses if provided
    if (updateCustomerDto.street || updateCustomerDto.city) {
      const currentAddresses = customer.addresses as any[];
      const updatedAddresses = currentAddresses.map(address => {
        if (address.isPrimary) {
          return {
            ...address,
            street: updateCustomerDto.street || address.street,
            number: updateCustomerDto.number || address.number,
            complement: updateCustomerDto.complement || address.complement,
            neighborhood: updateCustomerDto.neighborhood || address.neighborhood,
            city: updateCustomerDto.city || address.city,
            state: updateCustomerDto.state || address.state,
            zipCode: updateCustomerDto.zipCode || address.zipCode,
            country: updateCustomerDto.country || address.country,
          };
        }
        return address;
      });
      updateData.addresses = updatedAddresses;
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string) {
    const customer = await this.findOne(id, companyId);

    // Soft delete - set deletedAt instead of removing from database
    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
  }

  async getCustomerStats(companyId: string) {
    const [
      totalCustomers,
      activeCustomers,
      vipCustomers,
      customersWithTransactions,
      totalTransactions,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.customer.count({ where: { companyId, status: CustomerStatus.ACTIVE } }),
      this.prisma.customer.count({ where: { companyId, isVip: true } }),
      this.prisma.customer.count({
        where: {
          companyId,
          transactions: { some: {} },
        },
      }),
      this.prisma.transaction.count({
        where: {
          companyId,
          customer: { isNot: null },
        },
      }),
    ]);

    return {
      totalCustomers,
      activeCustomers,
      vipCustomers,
      customersWithTransactions,
      totalTransactions,
    };
  }

  async getTopCustomers(companyId: string, limit: number = 10) {
    const customers = await this.prisma.customer.findMany({
      where: { companyId, status: CustomerStatus.ACTIVE },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: [
        { isVip: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return customers;
  }

  async getCustomerTransactions(id: string, companyId: string, page: number = 1, limit: number = 10) {
    await this.findOne(id, companyId); // Verify customer exists

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          customerId: id,
          companyId,
        },
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
        include: {
          items: {
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.transaction.count({
        where: {
          customerId: id,
          companyId,
        },
      }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateCustomerStatus(id: string, status: CustomerStatus, companyId: string) {
    await this.findOne(id, companyId); // Verify customer exists

    return this.prisma.customer.update({
      where: { id },
      data: { status },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
  }

  async toggleVip(id: string, companyId: string) {
    const customer = await this.findOne(id, companyId);

    return this.prisma.customer.update({
      where: { id },
      data: { isVip: !customer.isVip },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
  }
}
