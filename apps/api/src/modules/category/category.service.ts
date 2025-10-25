import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MoveCategoryDto } from './dto/move-category.dto';
import { CategoryStatus } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, companyId: string) {
    // Generate slug if not provided
    const slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

    // Check if category with same slug already exists in company
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        slug,
        companyId,
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists in your company');
    }

    // Verify parent category exists (if provided)
    if (createCategoryDto.parentId) {
      const parentCategory = await this.prisma.category.findFirst({
        where: {
          id: createCategoryDto.parentId,
          companyId,
        },
      });

      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
    }

    // Generate fullPath based on hierarchy
    const fullPath = await this.generateFullPath(createCategoryDto.parentId, slug, companyId);

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        slug,
        status: createCategoryDto.status || CategoryStatus.ACTIVE,
        parentId: createCategoryDto.parentId,
        icon: createCategoryDto.icon,
        sortOrder: createCategoryDto.sortOrder || 0,
        fullPath,
        companyId,
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    return category;
  }

  async findAll(companyId: string, includeInactive: boolean = false) {
    const where: any = { 
      companyId,
      deletedAt: null // Exclude soft-deleted records
    };
    
    if (!includeInactive) {
      where.status = CategoryStatus.ACTIVE;
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          where: includeInactive ? {} : { status: CategoryStatus.ACTIVE },
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' },
          ],
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    return this.buildCategoryTree(categories);
  }

  async findOne(id: string, companyId: string) {
    const category = await this.prisma.category.findFirst({
      where: { 
        id, 
        companyId,
        deletedAt: null // Exclude soft-deleted records
      },
      include: {
        parent: true,
        children: {
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' },
          ],
        },
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, companyId: string) {
    const category = await this.findOne(id, companyId);

    // Generate slug if name is being updated
    let slug = category.slug;
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      slug = updateCategoryDto.slug || this.generateSlug(updateCategoryDto.name);
    }

    // Check if slug is being changed and if it's unique
    if (slug !== category.slug) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          slug,
          companyId,
          id: { not: id },
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this slug already exists in your company');
      }
    }

    // Verify parent category exists (if being changed)
    if (updateCategoryDto.parentId && updateCategoryDto.parentId !== category.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentCategory = await this.prisma.category.findFirst({
        where: {
          id: updateCategoryDto.parentId,
          companyId,
        },
      });

      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }

      // Check for circular reference
      if (await this.wouldCreateCircularReference(id, updateCategoryDto.parentId, companyId)) {
        throw new BadRequestException('Cannot create circular reference in category hierarchy');
      }
    }

    // Generate new fullPath if parent is being changed
    let fullPath = category.fullPath;
    if (updateCategoryDto.parentId !== category.parentId) {
      fullPath = await this.generateFullPath(updateCategoryDto.parentId, slug, companyId);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: updateCategoryDto.name,
        description: updateCategoryDto.description,
        slug,
        status: updateCategoryDto.status,
        parentId: updateCategoryDto.parentId,
        icon: updateCategoryDto.icon,
        sortOrder: updateCategoryDto.sortOrder,
        fullPath,
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });
  }

  async move(id: string, moveCategoryDto: MoveCategoryDto, companyId: string) {
    const category = await this.findOne(id, companyId);

    // Verify new parent category exists (if provided)
    if (moveCategoryDto.parentId) {
      if (moveCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentCategory = await this.prisma.category.findFirst({
        where: {
          id: moveCategoryDto.parentId,
          companyId,
        },
      });

      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }

      // Check for circular reference
      if (await this.wouldCreateCircularReference(id, moveCategoryDto.parentId, companyId)) {
        throw new BadRequestException('Cannot create circular reference in category hierarchy');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        parentId: moveCategoryDto.parentId,
        sortOrder: moveCategoryDto.sortOrder,
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string) {
    const category = await this.findOne(id, companyId);

    // Check if category has children
    if (category._count.children > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    // Check if category has products
    if (category._count.products > 0) {
      // Check if all products in this category are inactive
      const activeProductsCount = await this.prisma.product.count({
        where: {
          categoryId: id,
          companyId,
          status: 'ACTIVE',
          deletedAt: null // Exclude soft-deleted products
        }
      });

      if (activeProductsCount > 0) {
        throw new BadRequestException(`Cannot delete category with ${activeProductsCount} active products. Please deactivate or delete the products first.`);
      }

      // If all products are inactive, soft delete them first
      await this.prisma.product.updateMany({
        where: {
          categoryId: id,
          companyId,
          status: { in: ['INACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK'] },
          deletedAt: null // Only soft delete products that aren't already deleted
        },
        data: { deletedAt: new Date() }
      });
    }

    // Soft delete category instead of hard delete
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getCategoryStats(companyId: string) {
    const [
      totalCategories,
      activeCategories,
      categoriesWithProducts,
      rootCategories,
    ] = await Promise.all([
      this.prisma.category.count({ where: { companyId } }),
      this.prisma.category.count({ where: { companyId, status: CategoryStatus.ACTIVE } }),
      this.prisma.category.count({
        where: {
          companyId,
          products: { some: {} },
        },
      }),
      this.prisma.category.count({
        where: {
          companyId,
          parentId: null,
          status: CategoryStatus.ACTIVE,
        },
      }),
    ]);

    return {
      totalCategories,
      activeCategories,
      categoriesWithProducts,
      rootCategories,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async generateFullPath(parentId: string | null | undefined, slug: string, companyId: string): Promise<string> {
    if (!parentId) {
      return slug;
    }

    const parent = await this.prisma.category.findFirst({
      where: { id: parentId, companyId },
      select: { fullPath: true },
    });

    if (!parent) {
      return slug;
    }

    return `${parent.fullPath}/${slug}`;
  }

  private buildCategoryTree(categories: any[]): any[] {
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // Create a map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build the tree structure
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.id);
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories;
  }

  private async wouldCreateCircularReference(categoryId: string, newParentId: string, companyId: string): Promise<boolean> {
    let currentParentId: string | null = newParentId;
    
    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }
      
      const parent = await this.prisma.category.findFirst({
        where: { id: currentParentId, companyId },
        select: { parentId: true },
      });
      
      currentParentId = parent?.parentId || null;
    }
    
    return false;
  }
}
