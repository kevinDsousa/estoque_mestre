import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierContactDto } from './dto/supplier-contact.dto';
import { SupplierStatus } from '@prisma/client';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto, companyId: string) {
    // Check if supplier with same document already exists in company
    const existingSupplier = await this.prisma.supplier.findFirst({
      where: {
        document: createSupplierDto.document,
        companyId,
      },
    });

    if (existingSupplier) {
      throw new ConflictException('Supplier with this document already exists in your company');
    }

    // Prepare contacts and addresses as JSON
    const contacts = [
      {
        name: createSupplierDto.contactPerson || createSupplierDto.name,
        email: createSupplierDto.email,
        phone: createSupplierDto.phone,
        secondaryPhone: createSupplierDto.secondaryPhone,
        isPrimary: true,
      },
    ];

    const addresses = [
      {
        type: 'MAIN',
        street: createSupplierDto.street,
        number: createSupplierDto.number,
        complement: createSupplierDto.complement,
        neighborhood: createSupplierDto.neighborhood,
        city: createSupplierDto.city,
        state: createSupplierDto.state,
        zipCode: createSupplierDto.zipCode,
        country: createSupplierDto.country || 'Brasil',
        isPrimary: true,
      },
    ];

    const supplier = await this.prisma.supplier.create({
      data: {
        name: createSupplierDto.name,
        legalName: createSupplierDto.legalName,
        document: createSupplierDto.document,
        type: createSupplierDto.type,
        status: createSupplierDto.status || SupplierStatus.ACTIVE,
        contacts,
        addresses,
        website: createSupplierDto.website,
        description: createSupplierDto.description,
        paymentDays: createSupplierDto.paymentTerms || 30,
        creditLimit: createSupplierDto.creditLimit,
        notes: createSupplierDto.notes,
        isPreferred: createSupplierDto.isPreferred || false,
        companyId,
      },
      include: {
        _count: {
          select: {
            products: true,
            transactions: true,
          },
        },
      },
    });

    return supplier;
  }

  async findAll(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    status?: SupplierStatus,
    type?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = { companyId };
    
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
    
    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              products: true,
              transactions: true,
            },
          },
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
            costPrice: true,
            currentStock: true,
          },
          take: 10,
        },
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
            products: true,
            transactions: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto, companyId: string) {
    const supplier = await this.findOne(id, companyId);

    // Check if document is being changed and if it's unique
    if (updateSupplierDto.document && updateSupplierDto.document !== supplier.document) {
      const existingSupplier = await this.prisma.supplier.findFirst({
        where: {
          document: updateSupplierDto.document,
          companyId,
          id: { not: id },
        },
      });

      if (existingSupplier) {
        throw new ConflictException('Supplier with this document already exists in your company');
      }
    }

    // Prepare update data
    const updateData: any = {
      name: updateSupplierDto.name,
      legalName: updateSupplierDto.legalName,
      document: updateSupplierDto.document,
      type: updateSupplierDto.type,
      status: updateSupplierDto.status,
      website: updateSupplierDto.website,
      description: updateSupplierDto.description,
      paymentDays: updateSupplierDto.paymentTerms,
      creditLimit: updateSupplierDto.creditLimit,
      notes: updateSupplierDto.notes,
      isPreferred: updateSupplierDto.isPreferred,
    };

    // Update contacts if provided
    if (updateSupplierDto.email || updateSupplierDto.phone || updateSupplierDto.contactPerson) {
      const currentContacts = supplier.contacts as any[];
      const updatedContacts = currentContacts.map(contact => {
        if (contact.isPrimary) {
          return {
            ...contact,
            name: updateSupplierDto.contactPerson || contact.name,
            email: updateSupplierDto.email || contact.email,
            phone: updateSupplierDto.phone || contact.phone,
            secondaryPhone: updateSupplierDto.secondaryPhone || contact.secondaryPhone,
          };
        }
        return contact;
      });
      updateData.contacts = updatedContacts;
    }

    // Update addresses if provided
    if (updateSupplierDto.street || updateSupplierDto.city) {
      const currentAddresses = supplier.addresses as any[];
      const updatedAddresses = currentAddresses.map(address => {
        if (address.isPrimary) {
          return {
            ...address,
            street: updateSupplierDto.street || address.street,
            number: updateSupplierDto.number || address.number,
            complement: updateSupplierDto.complement || address.complement,
            neighborhood: updateSupplierDto.neighborhood || address.neighborhood,
            city: updateSupplierDto.city || address.city,
            state: updateSupplierDto.state || address.state,
            zipCode: updateSupplierDto.zipCode || address.zipCode,
            country: updateSupplierDto.country || address.country,
          };
        }
        return address;
      });
      updateData.addresses = updatedAddresses;
    }

    return this.prisma.supplier.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            products: true,
            transactions: true,
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string) {
    const supplier = await this.findOne(id, companyId);

    // Check if supplier has products
    if (supplier._count.products > 0) {
      throw new BadRequestException('Cannot delete supplier with products');
    }

    // Check if supplier has transactions
    if (supplier._count.transactions > 0) {
      throw new BadRequestException('Cannot delete supplier with transaction history');
    }

    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  async getSupplierStats(companyId: string) {
    const [
      totalSuppliers,
      activeSuppliers,
      preferredSuppliers,
      suppliersWithProducts,
      totalProducts,
    ] = await Promise.all([
      this.prisma.supplier.count({ where: { companyId } }),
      this.prisma.supplier.count({ where: { companyId, status: SupplierStatus.ACTIVE } }),
      this.prisma.supplier.count({ where: { companyId, isPreferred: true } }),
      this.prisma.supplier.count({
        where: {
          companyId,
          products: { some: {} },
        },
      }),
      this.prisma.product.count({
        where: {
          companyId,
          supplier: { isNot: null },
        },
      }),
    ]);

    return {
      totalSuppliers,
      activeSuppliers,
      preferredSuppliers,
      suppliersWithProducts,
      totalProducts,
    };
  }

  async getTopSuppliers(companyId: string, limit: number = 10) {
    const suppliers = await this.prisma.supplier.findMany({
      where: { companyId, status: SupplierStatus.ACTIVE },
      include: {
        _count: {
          select: {
            products: true,
            transactions: true,
          },
        },
      },
      orderBy: [
        { isPreferred: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return suppliers;
  }

  async getSupplierProducts(id: string, companyId: string, page: number = 1, limit: number = 10) {
    await this.findOne(id, companyId); // Verify supplier exists

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          supplierId: id,
          companyId,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.product.count({
        where: {
          supplierId: id,
          companyId,
        },
      }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateSupplierStatus(id: string, status: SupplierStatus, companyId: string) {
    await this.findOne(id, companyId); // Verify supplier exists

    return this.prisma.supplier.update({
      where: { id },
      data: { status },
      include: {
        _count: {
          select: {
            products: true,
            transactions: true,
          },
        },
      },
    });
  }

  async togglePreferred(id: string, companyId: string) {
    const supplier = await this.findOne(id, companyId);

    return this.prisma.supplier.update({
      where: { id },
      data: { isPreferred: !supplier.isPreferred },
      include: {
        _count: {
          select: {
            products: true,
            transactions: true,
          },
        },
      },
    });
  }
}