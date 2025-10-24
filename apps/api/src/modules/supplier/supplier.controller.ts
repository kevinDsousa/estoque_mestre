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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierContactDto } from './dto/supplier-contact.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SupplierStatus } from '@prisma/client';

@ApiTags('suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  @ApiResponse({ status: 409, description: 'Supplier with this document or email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createSupplierDto: CreateSupplierDto, @Request() req) {
    return this.supplierService.create(createSupplierDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: SupplierStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by type' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, document, email, or contact person' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  findAll(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: SupplierStatus,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.supplierService.findAll(req.user.companyId, page, limit, status, type, search);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get supplier statistics' })
  @ApiResponse({ status: 200, description: 'Supplier statistics retrieved successfully' })
  getStats(@Request() req) {
    return this.supplierService.getSupplierStats(req.user.companyId);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top suppliers by product count' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of suppliers to return' })
  @ApiResponse({ status: 200, description: 'Top suppliers retrieved successfully' })
  getTopSuppliers(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.supplierService.getTopSuppliers(req.user.companyId, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.supplierService.findOne(id, req.user.companyId);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get supplier products' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Supplier products retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  getSupplierProducts(
    @Param('id') id: string,
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.supplierService.getSupplierProducts(id, req.user.companyId, page, limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 409, description: 'Supplier with this document or email already exists' })
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto, @Request() req) {
    return this.supplierService.update(id, updateSupplierDto, req.user.companyId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update supplier status' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier status updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  updateStatus(
    @Param('id') id: string, 
    @Body('status') status: SupplierStatus, 
    @Body('updateProducts') updateProducts: boolean,
    @Request() req
  ) {
    return this.supplierService.updateSupplierStatus(id, status, req.user.companyId, updateProducts);
  }

  @Patch(':id/toggle-preferred')
  @ApiOperation({ summary: 'Toggle supplier preferred status' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier preferred status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  togglePreferred(@Param('id') id: string, @Request() req) {
    return this.supplierService.togglePreferred(id, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete supplier with products or transaction history' })
  remove(@Param('id') id: string, @Request() req) {
    return this.supplierService.remove(id, req.user.companyId);
  }
}
