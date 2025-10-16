import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MoveCategoryDto } from './dto/move-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category with this slug already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    return this.categoryService.create(createCategoryDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories (tree structure)' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  findAll(@Request() req, @Query('includeInactive') includeInactive?: boolean) {
    return this.categoryService.findAll(req.user.companyId, includeInactive === true);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get category statistics' })
  @ApiResponse({ status: 200, description: 'Category statistics retrieved successfully' })
  getStats(@Request() req) {
    return this.categoryService.getCategoryStats(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.categoryService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category with this slug already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data or circular reference' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Request() req) {
    return this.categoryService.update(id, updateCategoryDto, req.user.companyId);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move category to different parent' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category moved successfully' })
  @ApiResponse({ status: 404, description: 'Category or parent not found' })
  @ApiResponse({ status: 400, description: 'Invalid move operation or circular reference' })
  move(@Param('id') id: string, @Body() moveCategoryDto: MoveCategoryDto, @Request() req) {
    return this.categoryService.move(id, moveCategoryDto, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete category with subcategories or products' })
  remove(@Param('id') id: string, @Request() req) {
    return this.categoryService.remove(id, req.user.companyId);
  }
}
