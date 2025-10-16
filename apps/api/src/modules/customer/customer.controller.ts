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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerContactDto } from './dto/customer-contact.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CustomerStatus } from '@prisma/client';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 409, description: 'Customer with this document already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    return this.customerService.create(createCustomerDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: CustomerStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by type' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, document, or description' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  findAll(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: CustomerStatus,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.customerService.findAll(req.user.companyId, page, limit, status, type, search);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({ status: 200, description: 'Customer statistics retrieved successfully' })
  getStats(@Request() req) {
    return this.customerService.getCustomerStats(req.user.companyId);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top customers by transaction count' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of customers to return' })
  @ApiResponse({ status: 200, description: 'Top customers retrieved successfully' })
  getTopCustomers(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.customerService.getTopCustomers(req.user.companyId, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.customerService.findOne(id, req.user.companyId);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get customer transactions' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Customer transactions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  getCustomerTransactions(
    @Param('id') id: string,
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.customerService.getCustomerTransactions(id, req.user.companyId, page, limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Customer with this document already exists' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Request() req) {
    return this.customerService.update(id, updateCustomerDto, req.user.companyId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update customer status' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer status updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: CustomerStatus, @Request() req) {
    return this.customerService.updateCustomerStatus(id, status, req.user.companyId);
  }

  @Patch(':id/toggle-vip')
  @ApiOperation({ summary: 'Toggle customer VIP status' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer VIP status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  toggleVip(@Param('id') id: string, @Request() req) {
    return this.customerService.toggleVip(id, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete customer with transaction history' })
  remove(@Param('id') id: string, @Request() req) {
    return this.customerService.remove(id, req.user.companyId);
  }
}
