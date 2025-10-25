import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionPaymentDto } from './dto/transaction-payment.dto';
import { TransactionType, PaymentStatus, MovementType, MovementReason } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto, companyId: string, userId: string) {
    // Validate customer/supplier exists
    if (createTransactionDto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: createTransactionDto.customerId, companyId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (createTransactionDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createTransactionDto.supplierId, companyId },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    // Validate products exist and calculate totals
    let totalAmount = 0;
    const validatedItems: any[] = [];

    for (const item of createTransactionDto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, companyId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      const itemTotal = (item.quantity * item.unitPrice) - (item.discount || 0);
      totalAmount += itemTotal;

      validatedItems.push({
        ...item,
        productId: product.id,
      });
    }

    // Apply transaction-level discount
    totalAmount -= createTransactionDto.discount || 0;
    totalAmount += createTransactionDto.tax || 0;
    totalAmount += createTransactionDto.shippingCost || 0;

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        type: createTransactionDto.type,
        status: 'PENDING', // Default status
        paymentStatus: createTransactionDto.paymentStatus || PaymentStatus.PENDING,
        companyId,
        customerId: createTransactionDto.customerId,
        supplierId: createTransactionDto.supplierId,
        userId,
        reference: createTransactionDto.reference,
        notes: createTransactionDto.notes,
        discount: createTransactionDto.discount,
        tax: createTransactionDto.tax,
        shippingCost: createTransactionDto.shippingCost,
        transactionDate: createTransactionDto.transactionDate ? new Date(createTransactionDto.transactionDate) : new Date(),
        dueDate: createTransactionDto.dueDate ? new Date(createTransactionDto.dueDate) : null,
      },
      include: {
        customer: true,
        supplier: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        items: true,
      },
    });

    // Create transaction items
    for (const item of validatedItems) {
      await this.prisma.transactionItem.create({
        data: {
          transactionId: transaction.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          notes: item.notes,
        },
      });
    }

    // Update inventory based on transaction type
    await this.updateInventory(transaction.id, companyId, createTransactionDto.type);

    return this.findOne(transaction.id, companyId);
  }

  async findAll(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    type?: TransactionType,
    status?: string,
    paymentStatus?: PaymentStatus,
    customerId?: string,
    supplierId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = { 
      companyId,
      deletedAt: null // Exclude soft-deleted records
    };
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (customerId) where.customerId = customerId;
    if (supplierId) where.supplierId = supplierId;
    
    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = new Date(dateFrom);
      if (dateTo) where.transactionDate.lte = new Date(dateTo);
    }
    
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, document: true },
          },
          supplier: {
            select: { id: true, name: true, document: true },
          },
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
          payments: true,
        },
      }),
      this.prisma.transaction.count({ where }),
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

  async findOne(id: string, companyId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { 
        id, 
        companyId,
        deletedAt: null // Exclude soft-deleted records
      },
      include: {
        customer: true,
        supplier: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, costPrice: true, sellingPrice: true },
            },
          },
        },
        payments: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, companyId: string) {
    const transaction = await this.findOne(id, companyId);

    // Check if transaction can be updated
    if (transaction.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot update completed transaction');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        type: updateTransactionDto.type,
        paymentStatus: updateTransactionDto.paymentStatus,
        customerId: updateTransactionDto.customerId,
        supplierId: updateTransactionDto.supplierId,
        reference: updateTransactionDto.reference,
        notes: updateTransactionDto.notes,
        discount: updateTransactionDto.discount,
        tax: updateTransactionDto.tax,
        shippingCost: updateTransactionDto.shippingCost,
        transactionDate: updateTransactionDto.transactionDate ? new Date(updateTransactionDto.transactionDate) : undefined,
        dueDate: updateTransactionDto.dueDate ? new Date(updateTransactionDto.dueDate) : undefined,
      },
      include: {
        customer: true,
        supplier: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        payments: true,
      },
    });
  }

  async remove(id: string, companyId: string) {
    const transaction = await this.findOne(id, companyId);

    // Check if transaction can be deleted
    if (transaction.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot delete completed transaction');
    }

    // Reverse inventory changes
    await this.reverseInventoryChanges(transaction.id, companyId);

    // Soft delete - set deletedAt instead of removing from database
    return this.prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addPayment(id: string, paymentDto: TransactionPaymentDto, companyId: string) {
    const transaction = await this.findOne(id, companyId);

    // Check if transaction can receive payments
    if (transaction.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Transaction is already fully paid');
    }

    const payment = await this.prisma.transactionPayment.create({
      data: {
        transactionId: id,
        method: paymentDto.method,
        amount: paymentDto.amount,
        reference: paymentDto.reference,
        processedAt: new Date(),
      },
    });

    // Check if transaction is now fully paid
    const totalPaid = await this.getTotalPaid(id);
    const totalAmount = await this.getTotalAmount(id);

    if (totalPaid >= totalAmount) {
      await this.prisma.transaction.update({
        where: { id },
        data: { 
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });
    }

    return payment;
  }

  async getTransactionStats(companyId: string, dateFrom?: string, dateTo?: string) {
    const where: any = { companyId };
    
    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = new Date(dateFrom);
      if (dateTo) where.transactionDate.lte = new Date(dateTo);
    }

    const [
      totalTransactions,
      totalSales,
      totalPurchases,
      pendingPayments,
      completedTransactions,
    ] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.count({ where: { ...where, type: TransactionType.SALE } }),
      this.prisma.transaction.count({ where: { ...where, type: TransactionType.PURCHASE } }),
      this.prisma.transaction.count({ where: { ...where, paymentStatus: PaymentStatus.PENDING } }),
      this.prisma.transaction.count({ where: { ...where, paymentStatus: PaymentStatus.PAID } }),
    ]);

    // Calculate total amounts
    const salesAmount = await this.getTotalAmountByType(companyId, TransactionType.SALE, dateFrom, dateTo);
    const purchasesAmount = await this.getTotalAmountByType(companyId, TransactionType.PURCHASE, dateFrom, dateTo);

    return {
      totalTransactions,
      totalSales,
      totalPurchases,
      pendingPayments,
      completedTransactions,
      salesAmount,
      purchasesAmount,
      netAmount: salesAmount - purchasesAmount,
    };
  }

  private async updateInventory(transactionId: string, companyId: string, type: TransactionType) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { items: true },
    });

    if (!transaction) return;

    for (const item of transaction.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) continue;

      let newStock = product.currentStock;
      let movementType: MovementType;
      let movementReason: MovementReason;

      switch (type) {
        case TransactionType.SALE:
          newStock -= item.quantity;
          movementType = MovementType.OUT;
          movementReason = MovementReason.SALE;
          break;
        case TransactionType.PURCHASE:
          newStock += item.quantity;
          movementType = MovementType.IN;
          movementReason = MovementReason.PURCHASE;
          break;
        case TransactionType.RETURN:
          newStock += item.quantity;
          movementType = MovementType.IN;
          movementReason = MovementReason.RETURN;
          break;
        default:
          continue;
      }

      // Update product stock
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { currentStock: newStock },
      });

      // Create inventory movement
      await this.prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          companyId,
          type: movementType,
          reason: movementReason,
          quantity: item.quantity,
          previousStock: product.currentStock,
          newStock,
          unitCost: item.unitPrice,
          totalCost: item.quantity * item.unitPrice,
          reference: `Transaction ${transactionId}`,
          transactionId,
          notes: `Transaction ${type.toLowerCase()}`,
          userId: transaction.userId,
        },
      });
    }
  }

  private async reverseInventoryChanges(transactionId: string, companyId: string) {
    const movements = await this.prisma.inventoryMovement.findMany({
      where: { transactionId, companyId },
    });

    for (const movement of movements) {
      const product = await this.prisma.product.findUnique({
        where: { id: movement.productId },
      });

      if (!product) continue;

      // Reverse the stock change
      const newStock = product.currentStock - (movement.newStock - movement.previousStock);

      await this.prisma.product.update({
        where: { id: movement.productId },
        data: { currentStock: newStock },
      });
    }
  }

  private async getTotalPaid(transactionId: string): Promise<number> {
    const result = await this.prisma.transactionPayment.aggregate({
      where: { transactionId },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  private async getTotalAmount(transactionId: string): Promise<number> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { items: true },
    });

    if (!transaction) return 0;

    let total = 0;
    for (const item of transaction.items) {
      total += (item.quantity * item.unitPrice) - (item.discount || 0);
    }

    total -= transaction.discount || 0;
    total += transaction.tax || 0;
    total += transaction.shippingCost || 0;

    return total;
  }

  private async getTotalAmountByType(companyId: string, type: TransactionType, dateFrom?: string, dateTo?: string): Promise<number> {
    const where: any = { companyId, type };
    
    if (dateFrom || dateTo) {
      where.transactionDate = {};
      if (dateFrom) where.transactionDate.gte = new Date(dateFrom);
      if (dateTo) where.transactionDate.lte = new Date(dateTo);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { items: true },
    });

    let total = 0;
    for (const transaction of transactions) {
      for (const item of transaction.items) {
        total += (item.quantity * item.unitPrice) - (item.discount || 0);
      }
      total -= transaction.discount || 0;
      total += transaction.tax || 0;
      total += transaction.shippingCost || 0;
    }

    return total;
  }
}
