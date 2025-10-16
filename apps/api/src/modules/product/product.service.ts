import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { ProductStatus, MovementType, MovementReason } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, companyId: string) {
    // Check if product with same SKU already exists in company
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        sku: createProductDto.sku,
        companyId,
      },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists in your company');
    }

    // Check if barcode is unique (if provided)
    if (createProductDto.barcode) {
      const existingBarcode = await this.prisma.product.findFirst({
        where: {
          barcode: createProductDto.barcode,
          companyId,
        },
      });

      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists in your company');
      }
    }

    // Verify category exists
    const category = await this.prisma.category.findFirst({
      where: {
        id: createProductDto.categoryId,
        companyId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify supplier exists (if provided)
    if (createProductDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: {
          id: createProductDto.supplierId,
          companyId,
        },
      });

      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    // Generate slug from name
    const slug = createProductDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        sku: createProductDto.sku,
        barcode: createProductDto.barcode,
        status: createProductDto.status || ProductStatus.ACTIVE,
        type: createProductDto.type,
        companyId,
        categoryId: createProductDto.categoryId,
        supplierId: createProductDto.supplierId,
        specifications: {},
        costPrice: createProductDto.costPrice,
        sellingPrice: createProductDto.sellingPrice,
        currentStock: createProductDto.currentStock,
        minStock: createProductDto.minStock,
        maxStock: createProductDto.maxStock,
        weight: createProductDto.weight,
        brand: createProductDto.brand,
        model: createProductDto.model,
        slug: slug,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    // Create initial stock movement
    if (createProductDto.currentStock > 0) {
      await this.prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          companyId,
          type: MovementType.IN,
          reason: MovementReason.PURCHASE,
          quantity: createProductDto.currentStock,
          previousStock: 0,
          newStock: createProductDto.currentStock,
          unitCost: createProductDto.costPrice,
          totalCost: createProductDto.costPrice * createProductDto.currentStock,
          notes: 'Initial stock',
          userId: 'system', // TODO: Get from auth context
        },
      });
    }

    return product;
  }

  async findAll(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    status?: ProductStatus,
    categoryId?: string,
    supplierId?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = { companyId };
    
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true },
          },
          supplier: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
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

  async findOne(id: string, companyId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
      include: {
        category: true,
        supplier: true,
        inventoryMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, companyId: string) {
    const product = await this.findOne(id, companyId);

    // Check if SKU is being changed and if it's unique
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          sku: updateProductDto.sku,
          companyId,
          id: { not: id },
        },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this SKU already exists in your company');
      }
    }

    // Check if barcode is being changed and if it's unique
    if (updateProductDto.barcode && updateProductDto.barcode !== product.barcode) {
      const existingBarcode = await this.prisma.product.findFirst({
        where: {
          barcode: updateProductDto.barcode,
          companyId,
          id: { not: id },
        },
      });

      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists in your company');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        sku: updateProductDto.sku,
        barcode: updateProductDto.barcode,
        status: updateProductDto.status,
        type: updateProductDto.type,
        categoryId: updateProductDto.categoryId,
        supplierId: updateProductDto.supplierId,
        costPrice: updateProductDto.costPrice,
        sellingPrice: updateProductDto.sellingPrice,
        currentStock: updateProductDto.currentStock,
        minStock: updateProductDto.minStock,
        maxStock: updateProductDto.maxStock,
        weight: updateProductDto.weight,
        brand: updateProductDto.brand,
        model: updateProductDto.model,
      },
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    // Check if product has inventory movements
    const movementCount = await this.prisma.inventoryMovement.count({
      where: { productId: id },
    });

    if (movementCount > 0) {
      throw new BadRequestException('Cannot delete product with inventory history');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async adjustStock(id: string, adjustStockDto: AdjustStockDto, companyId: string) {
    const product = await this.findOne(id, companyId);

    const newStock = product.currentStock + adjustStockDto.quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock for this adjustment');
    }

    // Update product stock
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: { currentStock: newStock },
    });

    // Create inventory movement record
    const movementType = adjustStockDto.quantity > 0 ? MovementType.IN : MovementType.OUT;
    const movementReason = MovementReason.ADJUSTMENT;
    
    await this.prisma.inventoryMovement.create({
      data: {
        productId: id,
        companyId,
        type: movementType,
        reason: movementReason,
        quantity: Math.abs(adjustStockDto.quantity),
        previousStock: product.currentStock - adjustStockDto.quantity,
        newStock: newStock,
        unitCost: product.costPrice,
        totalCost: product.costPrice * Math.abs(adjustStockDto.quantity),
        notes: adjustStockDto.notes || adjustStockDto.reason,
        userId: 'system', // TODO: Get from auth context
      },
    });

    return updatedProduct;
  }

  async transferStock(id: string, transferStockDto: TransferStockDto, companyId: string) {
    const product = await this.findOne(id, companyId);

    if (product.currentStock < transferStockDto.quantity) {
      throw new BadRequestException('Insufficient stock for transfer');
    }

    // For now, we'll just update the product without location validation
    // TODO: Implement location management when Location model is available

    // Update product (location will be handled when Location model is available)
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        // locationId: transferStockDto.targetLocationId, // TODO: Add when Location model exists
      },
    });

    // Create transfer movement
    await this.prisma.inventoryMovement.create({
      data: {
        productId: id,
        companyId,
        type: MovementType.TRANSFER,
        reason: MovementReason.TRANSFER,
        quantity: transferStockDto.quantity,
        previousStock: product.currentStock,
        newStock: product.currentStock, // Stock doesn't change in transfer
        unitCost: product.costPrice,
        totalCost: product.costPrice * transferStockDto.quantity,
        notes: `Transfer: ${transferStockDto.reason}`,
        userId: 'system', // TODO: Get from auth context
      },
    });

    return updatedProduct;
  }

  async getLowStockProducts(companyId: string) {
    return this.prisma.product.findMany({
      where: {
        companyId,
        currentStock: {
          lte: this.prisma.product.fields.minStock,
        },
        status: ProductStatus.ACTIVE,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
        supplier: {
          select: { id: true, name: true },
        },
      },
      orderBy: { currentStock: 'asc' },
    });
  }

  async getExpiringProducts(companyId: string, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.product.findMany({
      where: {
        companyId,
        // trackExpiration: true, // TODO: Add when field exists in schema
        // expirationDate: {
        //   lte: futureDate,
        //   gte: new Date(),
        // },
        status: ProductStatus.ACTIVE,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
        supplier: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'asc' }, // TODO: Change to expirationDate when field exists
    });
  }

  async getProductStats(companyId: string) {
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      expiringProducts,
      totalValue,
    ] = await Promise.all([
      this.prisma.product.count({ where: { companyId } }),
      this.prisma.product.count({ where: { companyId, status: ProductStatus.ACTIVE } }),
      this.prisma.product.count({
        where: {
          companyId,
          currentStock: { lte: this.prisma.product.fields.minStock },
          status: ProductStatus.ACTIVE,
        },
      }),
      this.prisma.product.count({
        where: {
          companyId,
          // trackExpiration: true, // TODO: Add when field exists in schema
          // expirationDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          status: ProductStatus.ACTIVE,
        },
      }),
      this.prisma.product.aggregate({
        where: { companyId, status: ProductStatus.ACTIVE },
        _sum: {
          currentStock: true,
        },
      }),
    ]);

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      expiringProducts,
      totalStockValue: totalValue._sum.currentStock || 0,
    };
  }
}