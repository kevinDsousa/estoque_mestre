import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../../database/prisma.service';
import { ProductService } from './product.service';
import { NotificationService } from '../notification/notification.service';
import { AuthContextService } from '../../common/services/auth-context.service';
import { ProductStatus, UserRole } from '@prisma/client';

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: DeepMockProxy<PrismaService>;
  let notificationService: DeepMockProxy<NotificationService>;
  let authContextService: DeepMockProxy<AuthContextService>;

  const mockCompanyId = 'company-1';
  const mockUserId = 'user-1';

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    sku: 'TEST-001',
    barcode: '1234567890123',
    description: 'Test product description',
    price: 29.99,
    cost: 15.00,
    minStock: 10,
    maxStock: 100,
    currentStock: 50,
    status: ProductStatus.ACTIVE,
    categoryId: 'category-1',
    supplierId: 'supplier-1',
    companyId: mockCompanyId,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: 'category-1',
      name: 'Test Category',
    },
    supplier: {
      id: 'supplier-1',
      name: 'Test Supplier',
    },
  };

  const mockCreateProductDto = {
    name: 'New Product',
    sku: 'NEW-001',
    barcode: '9876543210987',
    description: 'New product description',
    price: 39.99,
    cost: 20.00,
    minStock: 5,
    maxStock: 200,
    categoryId: 'category-1',
    supplierId: 'supplier-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: NotificationService,
          useValue: mockDeep<NotificationService>(),
        },
        {
          provide: AuthContextService,
          useValue: mockDeep<AuthContextService>(),
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get(PrismaService);
    notificationService = module.get(NotificationService);
    authContextService = module.get(AuthContextService);

    // Reset all mocks
    mockReset(prismaService);
    mockReset(notificationService);
    mockReset(authContextService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product successfully', async () => {
      // Arrange
      prismaService.product.findFirst.mockResolvedValue(null);
      prismaService.category.findFirst.mockResolvedValue({ id: 'category-1', name: 'Test Category' });
      prismaService.supplier.findFirst.mockResolvedValue({ id: 'supplier-1', name: 'Test Supplier' });
      prismaService.product.create.mockResolvedValue(mockProduct);

      // Act
      const result = await service.create(mockCreateProductDto, mockCompanyId);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(prismaService.product.findFirst).toHaveBeenCalledWith({
        where: {
          companyId: mockCompanyId,
          sku: mockCreateProductDto.sku,
        },
      });
      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateProductDto,
          companyId: mockCompanyId,
          currentStock: 0,
          status: ProductStatus.ACTIVE,
        },
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      });
    });

    it('should throw ConflictException when SKU already exists', async () => {
      // Arrange
      prismaService.product.findFirst.mockResolvedValue(mockProduct);

      // Act & Assert
      await expect(service.create(mockCreateProductDto, mockCompanyId))
        .rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when barcode already exists', async () => {
      // Arrange
      const existingProduct = { ...mockProduct, sku: 'DIFFERENT-SKU' };
      prismaService.product.findFirst.mockResolvedValue(existingProduct);

      // Act & Assert
      await expect(service.create(mockCreateProductDto, mockCompanyId))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated products with filters', async () => {
      // Arrange
      const mockProducts = [mockProduct];
      const mockTotal = 1;

      prismaService.product.findMany.mockResolvedValue(mockProducts);
      prismaService.product.count.mockResolvedValue(mockTotal);

      // Act
      const result = await service.findAll(
        mockCompanyId,
        1,
        10,
        ProductStatus.ACTIVE,
        'category-1',
        undefined,
        'test'
      );

      // Assert
      expect(result).toEqual({
        products: mockProducts,
        pagination: {
          page: 1,
          limit: 10,
          total: mockTotal,
          totalPages: 1,
        },
      });

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          companyId: mockCompanyId,
          status: ProductStatus.ACTIVE,
          categoryId: 'category-1',
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { sku: { contains: 'test', mode: 'insensitive' } },
            { barcode: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return products without filters when query is empty', async () => {
      // Arrange
      const mockProducts = [mockProduct];
      const mockTotal = 1;

      prismaService.product.findMany.mockResolvedValue(mockProducts);
      prismaService.product.count.mockResolvedValue(mockTotal);

      // Act
      const result = await service.findAll(mockCompanyId);

      // Assert
      expect(result.products).toEqual(mockProducts);
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      // Arrange
      const productId = 'product-1';
      prismaService.product.findFirst.mockResolvedValue(mockProduct);

      // Act
      const result = await service.findOne(productId, mockCompanyId);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(prismaService.product.findFirst).toHaveBeenCalledWith({
        where: { id: productId, companyId: mockCompanyId },
        include: {
          category: true,
          supplier: true,
          inventoryMovements: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    });

    it('should throw NotFoundException when product is not found', async () => {
      // Arrange
      const productId = 'nonexistent-product';
      prismaService.product.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(productId, mockCompanyId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      // Arrange
      const productId = 'product-1';
      const updateDto = {
        name: 'Updated Product',
        price: 49.99,
      };

      const updatedProduct = { ...mockProduct, ...updateDto };
      prismaService.product.findFirst.mockResolvedValue(mockProduct);
      prismaService.product.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await service.update(productId, updateDto, mockCompanyId);

      // Assert
      expect(result).toEqual(updatedProduct);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          name: updateDto.name,
          description: undefined,
          sku: undefined,
          barcode: undefined,
          status: undefined,
          type: undefined,
          categoryId: undefined,
          supplierId: undefined,
          costPrice: undefined,
          sellingPrice: undefined,
          currentStock: undefined,
          minStock: undefined,
          maxStock: undefined,
          weight: undefined,
          brand: undefined,
          model: undefined,
        },
        include: {
          category: true,
          supplier: true,
        },
      });
    });

    it('should throw NotFoundException when product is not found', async () => {
      // Arrange
      const productId = 'nonexistent-product';
      const updateDto = { name: 'Updated Product' };
      prismaService.product.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(productId, updateDto, mockCompanyId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a product successfully', async () => {
      // Arrange
      const productId = 'product-1';
      const deletedProduct = mockProduct;
      
      prismaService.product.findFirst.mockResolvedValue(mockProduct);
      prismaService.inventoryMovement.count.mockResolvedValue(0);
      prismaService.product.delete.mockResolvedValue(deletedProduct);

      // Act
      const result = await service.remove(productId, mockCompanyId);

      // Assert
      expect(result).toEqual(deletedProduct);
      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should throw NotFoundException when product is not found', async () => {
      // Arrange
      const productId = 'nonexistent-product';
      prismaService.product.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(productId, mockCompanyId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('adjustStock', () => {
    it('should increase stock successfully', async () => {
      // Arrange
      const productId = 'product-1';
      const adjustmentDto = {
        quantity: 10,
        reason: 'Purchase',
        notes: 'Stock received from supplier',
      };

      const updatedProduct = {
        ...mockProduct,
        currentStock: mockProduct.currentStock + adjustmentDto.quantity,
      };

      prismaService.product.findFirst.mockResolvedValue(mockProduct);
      prismaService.product.update.mockResolvedValue(updatedProduct);
      prismaService.inventoryMovement.create.mockResolvedValue({} as any);

      // Act
      const result = await service.adjustStock(productId, adjustmentDto, mockCompanyId, mockUserId);

      // Assert
      expect(result).toEqual(updatedProduct);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { currentStock: mockProduct.currentStock + adjustmentDto.quantity },
      });
      expect(prismaService.inventoryMovement.create).toHaveBeenCalledWith({
        data: {
          productId,
          companyId: mockCompanyId,
          type: 'IN',
          reason: 'ADJUSTMENT',
          quantity: Math.abs(adjustmentDto.quantity),
          previousStock: mockProduct.currentStock - adjustmentDto.quantity,
          newStock: mockProduct.currentStock + adjustmentDto.quantity,
          unitCost: mockProduct.costPrice,
          totalCost: mockProduct.costPrice * Math.abs(adjustmentDto.quantity),
          notes: adjustmentDto.notes || adjustmentDto.reason,
          userId: 'system',
        },
      });
    });

    it('should decrease stock successfully', async () => {
      // Arrange
      const productId = 'product-1';
      const adjustmentDto = {
        quantity: -5,
        reason: 'Sale',
        notes: 'Product sold',
      };

      const updatedProduct = {
        ...mockProduct,
        currentStock: mockProduct.currentStock + adjustmentDto.quantity,
      };

      prismaService.product.findFirst.mockResolvedValue(mockProduct);
      prismaService.product.update.mockResolvedValue(updatedProduct);
      prismaService.inventoryMovement.create.mockResolvedValue({} as any);

      // Act
      const result = await service.adjustStock(productId, adjustmentDto, mockCompanyId, mockUserId);

      // Assert
      expect(result).toEqual(updatedProduct);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { currentStock: mockProduct.currentStock + adjustmentDto.quantity },
      });
    });

    it('should throw BadRequestException when stock would go negative', async () => {
      // Arrange
      const productId = 'product-1';
      const adjustmentDto = {
        quantity: -100, // More than current stock
        reason: 'Sale',
        notes: 'Product sold',
      };

      prismaService.product.findFirst.mockResolvedValue(mockProduct);

      // Act & Assert
      await expect(service.adjustStock(productId, adjustmentDto, mockCompanyId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when product is not found', async () => {
      // Arrange
      const productId = 'nonexistent-product';
      const adjustmentDto = {
        quantity: 10,
        reason: 'Purchase',
        notes: 'Stock received',
      };

      prismaService.product.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.adjustStock(productId, adjustmentDto, mockCompanyId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('transferStock', () => {
    it('should transfer stock between locations successfully', async () => {
      // Arrange
      const transferDto = {
        fromLocationId: 'location-1',
        toLocationId: 'location-2',
        quantity: 10,
        reason: 'Transfer',
        notes: 'Moving stock to new location',
      };

      const productId = 'product-1';
      const updatedProduct = mockProduct;

      prismaService.product.findFirst.mockResolvedValue(mockProduct);
      prismaService.product.update.mockResolvedValue(updatedProduct);
      prismaService.inventoryMovement.create.mockResolvedValue({} as any);

      // Act
      const result = await service.transferStock(productId, transferDto, mockCompanyId, mockUserId);

      // Assert
      expect(result).toEqual(updatedProduct);
      expect(prismaService.inventoryMovement.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when insufficient stock for transfer', async () => {
      // Arrange
      const transferDto = {
        fromLocationId: 'location-1',
        toLocationId: 'location-2',
        quantity: 1000, // More than current stock
        reason: 'Transfer',
        notes: 'Moving stock',
      };

      const productId = 'product-1';
      prismaService.product.findFirst.mockResolvedValue(mockProduct);

      // Act & Assert
      await expect(service.transferStock(productId, transferDto, mockCompanyId, mockUserId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products with low stock', async () => {
      // Arrange
      const lowStockProduct = {
        ...mockProduct,
        currentStock: 5, // Below minStock of 10
      };

      prismaService.product.findMany.mockResolvedValue([lowStockProduct]);

      // Act
      const result = await service.getLowStockProducts(mockCompanyId);

      // Assert
      expect(result).toEqual([lowStockProduct]);
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          companyId: mockCompanyId,
          status: ProductStatus.ACTIVE,
          currentStock: { lte: expect.any(Function) },
        },
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
        orderBy: { currentStock: 'asc' },
      });
    });
  });

});
