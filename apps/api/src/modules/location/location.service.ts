import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationTransferStockDto } from './dto/location-transfer-stock.dto';
import { LocationStatsDto } from './dto/location-stats.dto';
import { LocationType } from '@prisma/client';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto, companyId: string, userId: string) {
    // Check if location with same code already exists in company
    const existingLocation = await this.prisma.location.findFirst({
      where: {
        code: createLocationDto.code,
        companyId,
      },
    });

    if (existingLocation) {
      throw new ConflictException('Location with this code already exists in your company');
    }

    // Validate parent location if provided
    if (createLocationDto.parentId) {
      const parentLocation = await this.prisma.location.findFirst({
        where: {
          id: createLocationDto.parentId,
          companyId,
          isActive: true,
        },
      });

      if (!parentLocation) {
        throw new BadRequestException('Parent location not found or inactive');
      }
    }

    const location = await this.prisma.location.create({
      data: {
        ...createLocationDto,
        companyId,
        country: createLocationDto.country || 'Brasil',
        isActive: createLocationDto.isActive ?? true,
        currentStock: 0,
      },
      include: {
        parent: true,
        children: true,
        company: {
          select: { name: true },
        },
        _count: {
          select: {
            productBatches: true,
            inventoryMovementsFrom: true,
            inventoryMovementsTo: true,
          },
        },
      },
    });

    return location;
  }

  async findAll(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    type?: LocationType,
    isActive?: boolean,
    parentId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { companyId };

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;
    if (parentId) where.parentId = parentId;

    const [locations, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        skip,
        take: limit,
        include: {
          parent: {
            select: { id: true, name: true, code: true },
          },
          children: {
            select: { id: true, name: true, code: true, type: true, isActive: true },
          },
          _count: {
            select: {
              productBatches: true,
              inventoryMovementsFrom: true,
              inventoryMovementsTo: true,
            },
          },
        },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' },
        ],
      }),
      this.prisma.location.count({ where }),
    ]);

    return {
      data: locations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const location = await this.prisma.location.findFirst({
      where: { id, companyId },
      include: {
        parent: {
          select: { id: true, name: true, code: true, type: true },
        },
        children: {
          select: { 
            id: true, 
            name: true, 
            code: true, 
            type: true, 
            isActive: true,
            currentStock: true,
            capacity: true,
          },
        },
        productBatches: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        inventoryMovementsFrom: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
            toLocation: {
              select: { id: true, name: true, code: true },
            },
          },
          orderBy: { movementDate: 'desc' },
          take: 10,
        },
        inventoryMovementsTo: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
            fromLocation: {
              select: { id: true, name: true, code: true },
            },
          },
          orderBy: { movementDate: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            productBatches: true,
            inventoryMovementsFrom: true,
            inventoryMovementsTo: true,
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto, companyId: string, userId: string) {
    const location = await this.findOne(id, companyId);

    // Check if code is being changed and if it conflicts
    if (updateLocationDto.code && updateLocationDto.code !== location.code) {
      const existingLocation = await this.prisma.location.findFirst({
        where: {
          code: updateLocationDto.code,
          companyId,
          id: { not: id },
        },
      });

      if (existingLocation) {
        throw new ConflictException('Location with this code already exists in your company');
      }
    }

    // Validate parent location if being changed
    if (updateLocationDto.parentId && updateLocationDto.parentId !== location.parentId) {
      if (updateLocationDto.parentId === id) {
        throw new BadRequestException('Location cannot be its own parent');
      }

      const parentLocation = await this.prisma.location.findFirst({
        where: {
          id: updateLocationDto.parentId,
          companyId,
          isActive: true,
        },
      });

      if (!parentLocation) {
        throw new BadRequestException('Parent location not found or inactive');
      }

      // Check for circular references
      await this.validateNoCircularReference(id, updateLocationDto.parentId, companyId);
    }

    const updatedLocation = await this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            productBatches: true,
            inventoryMovementsFrom: true,
            inventoryMovementsTo: true,
          },
        },
      },
    });

    return updatedLocation;
  }

  async remove(id: string, companyId: string, userId: string) {
    const location = await this.findOne(id, companyId);

    // Check if location has children
    if (location.children.length > 0) {
      throw new BadRequestException('Cannot delete location with child locations');
    }

    // Check if location has product batches
    if (location._count.productBatches > 0) {
      throw new BadRequestException('Cannot delete location with product batches');
    }

    // Check if location has inventory movements
    if (location._count.inventoryMovementsFrom > 0 || location._count.inventoryMovementsTo > 0) {
      throw new BadRequestException('Cannot delete location with inventory movements');
    }

    await this.prisma.location.delete({
      where: { id },
    });

    return { message: 'Location deleted successfully' };
  }

  async transferStock(transferStockDto: LocationTransferStockDto, companyId: string, userId: string) {
    const { fromLocationId, toLocationId, quantity, reason, notes } = transferStockDto;

    if (fromLocationId === toLocationId) {
      throw new BadRequestException('Source and destination locations cannot be the same');
    }

    // Get both locations
    const [fromLocation, toLocation] = await Promise.all([
      this.prisma.location.findFirst({
        where: { id: fromLocationId, companyId, isActive: true },
      }),
      this.prisma.location.findFirst({
        where: { id: toLocationId, companyId, isActive: true },
      }),
    ]);

    if (!fromLocation) {
      throw new NotFoundException('Source location not found or inactive');
    }

    if (!toLocation) {
      throw new NotFoundException('Destination location not found or inactive');
    }

    // Check if source location has enough stock
    if (fromLocation.currentStock < quantity) {
      throw new BadRequestException('Insufficient stock in source location');
    }

    // Check destination capacity if specified
    if (toLocation.capacity && (toLocation.currentStock + quantity) > toLocation.capacity) {
      throw new BadRequestException('Transfer would exceed destination location capacity');
    }

    // Perform the transfer in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update stock counts
      await tx.location.update({
        where: { id: fromLocationId },
        data: { currentStock: { decrement: quantity } },
      });

      await tx.location.update({
        where: { id: toLocationId },
        data: { currentStock: { increment: quantity } },
      });

      // Create inventory movement record
      const movement = await tx.inventoryMovement.create({
        data: {
          productId: 'system', // This would be handled differently in a real product transfer
          companyId,
          type: 'TRANSFER',
          reason: 'TRANSFER',
          quantity,
          previousStock: fromLocation.currentStock,
          newStock: fromLocation.currentStock - quantity,
          fromLocationId,
          toLocationId,
          notes: notes || `Transfer from ${fromLocation.name} to ${toLocation.name}. ${reason || ''}`,
          userId,
        },
      });

      return movement;
    });

    return {
      message: 'Stock transferred successfully',
      movement: result,
      fromLocation: { ...fromLocation, currentStock: fromLocation.currentStock - quantity },
      toLocation: { ...toLocation, currentStock: toLocation.currentStock + quantity },
    };
  }

  async getLocationStats(companyId: string): Promise<LocationStatsDto> {
    const [
      total,
      active,
      inactive,
      locations,
      totalCapacity,
      usedCapacity,
      byType,
    ] = await Promise.all([
      this.prisma.location.count({ where: { companyId } }),
      this.prisma.location.count({ where: { companyId, isActive: true } }),
      this.prisma.location.count({ where: { companyId, isActive: false } }),
      this.prisma.location.findMany({
        where: { companyId },
        select: { currentStock: true, capacity: true, type: true },
      }),
      this.prisma.location.aggregate({
        where: { companyId, capacity: { not: null } },
        _sum: { capacity: true },
      }),
      this.prisma.location.aggregate({
        where: { companyId },
        _sum: { currentStock: true },
      }),
      this.prisma.location.groupBy({
        by: ['type'],
        where: { companyId },
        _count: { type: true },
      }),
    ]);

    const totalCapacityValue = totalCapacity._sum.capacity || 0;
    const usedCapacityValue = usedCapacity._sum.currentStock || 0;
    const utilizationPercentage = totalCapacityValue > 0 
      ? Math.round((usedCapacityValue / totalCapacityValue) * 100) 
      : 0;

    const byTypeMap = byType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    const lowStockLocations = locations.filter(loc => 
      loc.capacity && loc.currentStock < (loc.capacity * 0.2)
    ).length;

    const highStockLocations = locations.filter(loc => 
      loc.capacity && loc.currentStock > (loc.capacity * 0.8)
    ).length;

    return {
      total,
      active,
      inactive,
      totalCapacity: totalCapacityValue,
      usedCapacity: usedCapacityValue,
      utilizationPercentage,
      byType: byTypeMap,
      lowStockLocations,
      highStockLocations,
    };
  }

  async getLocationHierarchy(companyId: string) {
    const locations = await this.prisma.location.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        parentId: true,
        currentStock: true,
        capacity: true,
        children: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            currentStock: true,
            capacity: true,
          },
        },
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    // Build hierarchy tree
    const locationMap = new Map<string, any>();
    const rootLocations: any[] = [];

    // First pass: create map of all locations
    locations.forEach(location => {
      locationMap.set(location.id, { ...location, children: [] });
    });

    // Second pass: build hierarchy
    locations.forEach(location => {
      if (location.parentId) {
        const parent = locationMap.get(location.parentId);
        if (parent) {
          parent.children.push(locationMap.get(location.id));
        }
      } else {
        rootLocations.push(locationMap.get(location.id));
      }
    });

    return rootLocations;
  }

  private async validateNoCircularReference(locationId: string, parentId: string, companyId: string) {
    let currentParentId: string | null = parentId;
    const visited = new Set<string>();

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        throw new BadRequestException('Circular reference detected in location hierarchy');
      }

      if (currentParentId === locationId) {
        throw new BadRequestException('Circular reference detected: location cannot be ancestor of itself');
      }

      visited.add(currentParentId);

      const parent = await this.prisma.location.findFirst({
        where: { id: currentParentId, companyId },
        select: { parentId: true },
      });

      currentParentId = parent?.parentId || null;
    }
  }
}
