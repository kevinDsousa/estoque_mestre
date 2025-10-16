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
  ParseIntPipe,
  DefaultValuePipe,
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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProductStatus } from '@prisma/client';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 409, description: 'Product with this SKU or barcode already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productService.create(createProductDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category' })
  @ApiQuery({ name: 'supplierId', required: false, type: String, description: 'Filter by supplier' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, SKU, barcode, or description' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: ProductStatus,
    @Query('categoryId') categoryId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('search') search?: string,
  ) {
    return this.productService.findAll(
      req.user.companyId,
      page,
      limit,
      status,
      categoryId,
      supplierId,
      search,
    );
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({ status: 200, description: 'Low stock products retrieved successfully' })
  getLowStockProducts(@Request() req) {
    return this.productService.getLowStockProducts(req.user.companyId);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get products expiring soon' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Days ahead to check (default: 30)' })
  @ApiResponse({ status: 200, description: 'Expiring products retrieved successfully' })
  getExpiringProducts(
    @Request() req,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    return this.productService.getExpiringProducts(req.user.companyId, days);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiResponse({ status: 200, description: 'Product statistics retrieved successfully' })
  getProductStats(@Request() req) {
    return this.productService.getProductStats(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.productService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product with this SKU or barcode already exists' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req) {
    return this.productService.update(id, updateProductDto, req.user.companyId);
  }

  @Patch(':id/adjust-stock')
  @ApiOperation({ summary: 'Adjust product stock' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Insufficient stock for adjustment' })
  adjustStock(@Param('id') id: string, @Body() adjustStockDto: AdjustStockDto, @Request() req) {
    return this.productService.adjustStock(id, adjustStockDto, req.user.companyId);
  }

  @Patch(':id/transfer-stock')
  @ApiOperation({ summary: 'Transfer product to different location' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Stock transferred successfully' })
  @ApiResponse({ status: 404, description: 'Product or target location not found' })
  @ApiResponse({ status: 400, description: 'Insufficient stock for transfer' })
  transferStock(@Param('id') id: string, @Body() transferStockDto: TransferStockDto, @Request() req) {
    return this.productService.transferStock(id, transferStockDto, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete product with transaction history' })
  remove(@Param('id') id: string, @Request() req) {
    return this.productService.remove(id, req.user.companyId);
  }
}
