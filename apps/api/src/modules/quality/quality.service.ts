import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateQualityInspectionDto } from './dto/create-quality-inspection.dto';
import { UpdateQualityInspectionDto } from './dto/update-quality-inspection.dto';
import { QualityInspectionQueryDto } from './dto/quality-inspection-query.dto';
import { CreateProductBatchDto, UpdateProductBatchDto, BatchQualityStatusDto } from './dto/batch-quality.dto';
import { QualityStatus, BatchStatus } from '@prisma/client';

@Injectable()
export class QualityService {
  constructor(private prisma: PrismaService) {}

  // ===== QUALITY INSPECTIONS =====

  async createInspection(createInspectionDto: CreateQualityInspectionDto, companyId: string, userId: string) {
    // Verify product exists and belongs to company
    const product = await this.prisma.product.findFirst({
      where: { id: createInspectionDto.productId, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify inspector exists and belongs to company
    const inspector = await this.prisma.user.findFirst({
      where: { id: createInspectionDto.inspectorId, companyId },
    });

    if (!inspector) {
      throw new NotFoundException('Inspector not found');
    }

    // Check if inspection already exists for this batch
    const existingInspection = await this.prisma.qualityInspection.findFirst({
      where: {
        productId: createInspectionDto.productId,
        batchNumber: createInspectionDto.batchNumber,
        companyId,
      },
    });

    if (existingInspection) {
      throw new ConflictException('Inspection already exists for this batch');
    }

    // Calculate pass rate
    const passRate = this.calculatePassRate(createInspectionDto.results);

    // Create inspection
    const inspection = await this.prisma.qualityInspection.create({
      data: {
        productId: createInspectionDto.productId,
        batchNumber: createInspectionDto.batchNumber,
        inspectionDate: new Date(createInspectionDto.inspectionDate),
        inspectorId: createInspectionDto.inspectorId,
        companyId,
        results: createInspectionDto.results as any,
        status: createInspectionDto.status,
        notes: createInspectionDto.notes,
        passRate,
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        inspector: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Update product batch quality status if exists
    await this.updateBatchQualityStatus(
      createInspectionDto.productId,
      createInspectionDto.batchNumber,
      companyId,
      createInspectionDto.status === QualityStatus.APPROVED ? 'APPROVED' : 'PENDING'
    );

    return inspection;
  }

  async findAllInspections(query: QualityInspectionQueryDto, companyId: string) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { companyId };

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.batchNumber) {
      where.batchNumber = { contains: filters.batchNumber, mode: 'insensitive' };
    }

    if (filters.inspectorId) {
      where.inspectorId = filters.inspectorId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.inspectionDate = {};
      if (filters.startDate) {
        where.inspectionDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.inspectionDate.lte = new Date(filters.endDate);
      }
    }

    if (filters.search) {
      where.OR = [
        { batchNumber: { contains: filters.search, mode: 'insensitive' } },
        { product: { name: { contains: filters.search, mode: 'insensitive' } } },
        { inspector: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { inspector: { lastName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [inspections, total] = await Promise.all([
      this.prisma.qualityInspection.findMany({
        where,
        skip,
        take: limit,
        orderBy: { inspectionDate: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          inspector: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.qualityInspection.count({ where }),
    ]);

    return {
      data: inspections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOneInspection(id: string, companyId: string) {
    const inspection = await this.prisma.qualityInspection.findFirst({
      where: { id, companyId },
      include: {
        product: {
          select: { id: true, name: true, sku: true, specifications: true },
        },
        inspector: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    return inspection;
  }

  async updateInspection(id: string, updateInspectionDto: UpdateQualityInspectionDto, companyId: string, userId: string) {
    const inspection = await this.findOneInspection(id, companyId);

    // Recalculate pass rate if results are updated
    let passRate = inspection.passRate;
    if (updateInspectionDto.results) {
      passRate = this.calculatePassRate(updateInspectionDto.results);
    }

    const updatedInspection = await this.prisma.qualityInspection.update({
      where: { id },
      data: {
        status: updateInspectionDto.status,
        notes: updateInspectionDto.notes,
        results: updateInspectionDto.results as any,
        passRate,
        updatedAt: new Date(),
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        inspector: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Update batch quality status if status changed
    if (updateInspectionDto.status) {
      await this.updateBatchQualityStatus(
        inspection.productId,
        inspection.batchNumber,
        companyId,
        updateInspectionDto.status === QualityStatus.APPROVED ? 'APPROVED' : 'PENDING'
      );
    }

    return updatedInspection;
  }

  async removeInspection(id: string, companyId: string) {
    const inspection = await this.findOneInspection(id, companyId);

    await this.prisma.qualityInspection.delete({
      where: { id },
    });

    return { message: 'Inspection deleted successfully' };
  }

  async approveInspection(id: string, companyId: string, userId: string) {
    const inspection = await this.findOneInspection(id, companyId);

    if (inspection.status === QualityStatus.APPROVED) {
      throw new BadRequestException('Inspection is already approved');
    }

    const updatedInspection = await this.prisma.qualityInspection.update({
      where: { id },
      data: {
        status: QualityStatus.APPROVED,
        updatedAt: new Date(),
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        inspector: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Update batch quality status
    await this.updateBatchQualityStatus(
      inspection.productId,
      inspection.batchNumber,
      companyId,
      'APPROVED'
    );

    return updatedInspection;
  }

  async rejectInspection(id: string, companyId: string, userId: string, reason?: string) {
    const inspection = await this.findOneInspection(id, companyId);

    if (inspection.status === QualityStatus.REJECTED) {
      throw new BadRequestException('Inspection is already rejected');
    }

    const updatedInspection = await this.prisma.qualityInspection.update({
      where: { id },
      data: {
        status: QualityStatus.REJECTED,
        notes: reason ? `${inspection.notes || ''}\nRejection reason: ${reason}`.trim() : inspection.notes,
        updatedAt: new Date(),
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        inspector: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Update batch quality status
    await this.updateBatchQualityStatus(
      inspection.productId,
      inspection.batchNumber,
      companyId,
      'REJECTED'
    );

    return updatedInspection;
  }

  // ===== PRODUCT BATCHES =====

  async createBatch(createBatchDto: CreateProductBatchDto, companyId: string, userId: string) {
    // Verify product exists and belongs to company
    const product = await this.prisma.product.findFirst({
      where: { id: createBatchDto.productId, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify supplier exists and belongs to company
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: createBatchDto.supplierId, companyId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check if batch number already exists for this product
    const existingBatch = await this.prisma.productBatch.findFirst({
      where: {
        productId: createBatchDto.productId,
        batchNumber: createBatchDto.batchNumber,
        companyId,
      },
    });

    if (existingBatch) {
      throw new ConflictException('Batch number already exists for this product');
    }

    const batch = await this.prisma.productBatch.create({
      data: {
        productId: createBatchDto.productId,
        batchNumber: createBatchDto.batchNumber,
        manufacturingDate: new Date(createBatchDto.manufacturingDate),
        expiryDate: new Date(createBatchDto.expiryDate),
        supplierId: createBatchDto.supplierId,
        quantity: createBatchDto.quantity,
        remainingQuantity: createBatchDto.quantity, // Initially same as quantity
        // unitPrice: createBatchDto.unitPrice, // Field doesn't exist in schema
        locationString: createBatchDto.location,
        // notes: createBatchDto.notes, // Field doesn't exist in schema
        companyId,
        status: BatchStatus.ACTIVE,
        qualityStatus: 'PENDING',
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    return batch;
  }

  async findAllBatches(query: QualityInspectionQueryDto, companyId: string) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { companyId };

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.batchNumber) {
      where.batchNumber = { contains: filters.batchNumber, mode: 'insensitive' };
    }

    if (filters.search) {
      where.OR = [
        { batchNumber: { contains: filters.search, mode: 'insensitive' } },
        { product: { name: { contains: filters.search, mode: 'insensitive' } } },
        { supplier: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [batches, total] = await Promise.all([
      this.prisma.productBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { manufacturingDate: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          supplier: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.productBatch.count({ where }),
    ]);

    return {
      data: batches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOneBatch(id: string, companyId: string) {
    const batch = await this.prisma.productBatch.findFirst({
      where: { id, companyId },
      include: {
        product: {
          select: { id: true, name: true, sku: true, specifications: true },
        },
        supplier: {
          select: { id: true, name: true },
        },
        // qualityInspections: {
        //   orderBy: { inspectionDate: 'desc' },
        //   include: {
        //     inspector: {
        //       select: { id: true, firstName: true, lastName: true },
        //     },
        //   },
        // },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return batch;
  }

  async updateBatch(id: string, updateBatchDto: UpdateProductBatchDto, companyId: string, userId: string) {
    const batch = await this.findOneBatch(id, companyId);

    const updatedBatch = await this.prisma.productBatch.update({
      where: { id },
      data: {
        status: updateBatchDto.status,
        quantity: updateBatchDto.quantity,
        locationString: updateBatchDto.location,
        updatedAt: new Date(),
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    return updatedBatch;
  }

  async removeBatch(id: string, companyId: string) {
    const batch = await this.findOneBatch(id, companyId);

    await this.prisma.productBatch.delete({
      where: { id },
    });

    return { message: 'Batch deleted successfully' };
  }

  async updateBatchQualityStatusPublic(batchQualityDto: BatchQualityStatusDto, companyId: string, userId: string) {
    const batch = await this.findOneBatch(batchQualityDto.batchId, companyId);

    const updatedBatch = await this.prisma.productBatch.update({
      where: { id: batchQualityDto.batchId },
      data: {
        qualityStatus: batchQualityDto.qualityStatus,
        updatedAt: new Date(),
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        supplier: {
          select: { id: true, name: true },
        },
      },
    });

    return updatedBatch;
  }

  // ===== QUALITY STATISTICS =====

  async getQualityStats(companyId: string) {
    const [
      totalInspections,
      approvedInspections,
      rejectedInspections,
      pendingInspections,
      totalBatches,
      approvedBatches,
      rejectedBatches,
      pendingBatches,
      averagePassRate,
    ] = await Promise.all([
      this.prisma.qualityInspection.count({ where: { companyId } }),
      this.prisma.qualityInspection.count({ where: { companyId, status: QualityStatus.APPROVED } }),
      this.prisma.qualityInspection.count({ where: { companyId, status: QualityStatus.REJECTED } }),
      this.prisma.qualityInspection.count({ where: { companyId, status: QualityStatus.PENDING } }),
      this.prisma.productBatch.count({ where: { companyId } }),
      this.prisma.productBatch.count({ where: { companyId, qualityStatus: 'APPROVED' } }),
      this.prisma.productBatch.count({ where: { companyId, qualityStatus: 'REJECTED' } }),
      this.prisma.productBatch.count({ where: { companyId, qualityStatus: 'PENDING' } }),
      this.prisma.qualityInspection.aggregate({
        where: { companyId },
        _avg: { passRate: true } as any,
      }),
    ]);

    return {
      inspections: {
        total: totalInspections,
        approved: approvedInspections,
        rejected: rejectedInspections,
        pending: pendingInspections,
        approvalRate: totalInspections > 0 ? (approvedInspections / totalInspections) * 100 : 0,
        averagePassRate: (averagePassRate as any)._avg?.passRate || 0,
      },
      batches: {
        total: totalBatches,
        approved: approvedBatches,
        rejected: rejectedBatches,
        pending: pendingBatches,
        approvalRate: totalBatches > 0 ? (approvedBatches / totalBatches) * 100 : 0,
      },
    };
  }

  // ===== HELPER METHODS =====

  private calculatePassRate(results: any[]): number {
    if (results.length === 0) return 0;
    const passed = results.filter(result => result.status === 'PASS').length;
    return (passed / results.length) * 100;
  }

  private async updateBatchQualityStatus(
    productId: string,
    batchNumber: string,
    companyId: string,
    qualityStatus: 'APPROVED' | 'REJECTED' | 'PENDING'
  ) {
    await this.prisma.productBatch.updateMany({
      where: {
        productId,
        batchNumber,
        companyId,
      },
      data: {
        qualityStatus,
        updatedAt: new Date(),
      },
    });
  }
}
