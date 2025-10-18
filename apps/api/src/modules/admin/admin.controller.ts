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
  ParseEnumPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ApproveCompanyDto, RejectCompanyDto, SuspendCompanyDto, CompanyQueryDto } from './dto/admin-company.dto';
import { CreateBusinessMetricDto, BusinessMetricQueryDto } from './dto/admin-metrics.dto';
import { CreateAdminUserDto, UpdateAdminUserDto, AdminUserQueryDto } from './dto/admin-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../../common/guards/role.guard';
import { UserRole, CompanyStatus, BusinessMetricType, UserStatus } from '@prisma/client';
import { MetricPeriod } from './dto/admin-metrics.dto';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN) // Only admin users can access this controller
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===== COMPANY MANAGEMENT =====

  @Get('companies')
  @ApiOperation({ summary: 'Get all companies with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: CompanyStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name, CNPJ, or email' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive companies' })
  async getAllCompanies(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status', new DefaultValuePipe(undefined), new ParseEnumPipe(CompanyStatus, { optional: true })) status?: CompanyStatus,
    @Query('search') search?: string,
    @Query('includeInactive', new DefaultValuePipe(false)) includeInactive?: boolean,
  ) {
    const query: CompanyQueryDto = {
      page,
      limit,
      status,
      search,
      includeInactive,
    };
    return this.adminService.getAllCompanies(query);
  }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company by ID with detailed information' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async getCompanyById(@Param('id') id: string) {
    return this.adminService.getCompanyById(id);
  }

  @Post('companies/:id/approve')
  @ApiOperation({ summary: 'Approve a company' })
  @ApiResponse({ status: 200, description: 'Company approved successfully' })
  @ApiResponse({ status: 400, description: 'Company is already approved' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async approveCompany(
    @Param('id') id: string,
    @Body() approveDto: ApproveCompanyDto,
  ) {
    return this.adminService.approveCompany(id, approveDto);
  }

  @Post('companies/:id/reject')
  @ApiOperation({ summary: 'Reject a company' })
  @ApiResponse({ status: 200, description: 'Company rejected successfully' })
  @ApiResponse({ status: 400, description: 'Company is already rejected' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async rejectCompany(
    @Param('id') id: string,
    @Body() rejectDto: RejectCompanyDto,
  ) {
    return this.adminService.rejectCompany(id, rejectDto);
  }

  @Post('companies/:id/suspend')
  @ApiOperation({ summary: 'Suspend a company' })
  @ApiResponse({ status: 200, description: 'Company suspended successfully' })
  @ApiResponse({ status: 400, description: 'Company is already suspended' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async suspendCompany(
    @Param('id') id: string,
    @Body() suspendDto: SuspendCompanyDto,
  ) {
    return this.adminService.suspendCompany(id, suspendDto);
  }

  @Post('companies/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate a suspended company' })
  @ApiResponse({ status: 200, description: 'Company reactivated successfully' })
  @ApiResponse({ status: 400, description: 'Company is already active' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  async reactivateCompany(
    @Param('id') id: string,
    @User('userId') adminId: string,
  ) {
    return this.adminService.reactivateCompany(id, adminId);
  }

  // ===== ADMIN USER MANAGEMENT =====

  @Post('users')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({ status: 201, description: 'Admin user created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async createAdminUser(@Body() createAdminDto: CreateAdminUserDto) {
    return this.adminService.createAdminUser(createAdminDto);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all admin users with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Admin users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole, description: 'Filter by role' })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive users' })
  async getAllAdminUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('role', new DefaultValuePipe(undefined), new ParseEnumPipe(UserRole, { optional: true })) role?: UserRole,
    @Query('status', new DefaultValuePipe(undefined), new ParseEnumPipe(UserStatus, { optional: true })) status?: UserStatus,
    @Query('search') search?: string,
    @Query('includeInactive', new DefaultValuePipe(false)) includeInactive?: boolean,
  ) {
    const query: AdminUserQueryDto = {
      page,
      limit,
      role,
      status,
      search,
      includeInactive,
    };
    return this.adminService.getAllAdminUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get admin user by ID' })
  @ApiResponse({ status: 200, description: 'Admin user retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Admin user not found' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  async getAdminUserById(@Param('id') id: string) {
    return this.adminService.getAdminUserById(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update an admin user' })
  @ApiResponse({ status: 200, description: 'Admin user updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Admin user not found' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  async updateAdminUser(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminUserDto,
  ) {
    return this.adminService.updateAdminUser(id, updateAdminDto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete an admin user' })
  @ApiResponse({ status: 200, description: 'Admin user deleted successfully' })
  @ApiResponse({ status: 404, description: 'Admin user not found' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  async deleteAdminUser(@Param('id') id: string) {
    return this.adminService.deleteAdminUser(id);
  }

  // ===== BUSINESS METRICS =====

  @Post('metrics')
  @ApiOperation({ summary: 'Create a new business metric' })
  @ApiResponse({ status: 201, description: 'Business metric created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createBusinessMetric(@Body() createMetricDto: CreateBusinessMetricDto) {
    return this.adminService.createBusinessMetric(createMetricDto);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get business metrics with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Business metrics retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: BusinessMetricType, description: 'Filter by metric type' })
  @ApiQuery({ name: 'period', required: false, enum: MetricPeriod, description: 'Filter by period' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'companyId', required: false, type: String, description: 'Filter by company ID' })
  async getBusinessMetrics(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type', new DefaultValuePipe(undefined), new ParseEnumPipe(BusinessMetricType, { optional: true })) type?: BusinessMetricType,
    @Query('period', new DefaultValuePipe(undefined), new ParseEnumPipe(MetricPeriod, { optional: true })) period?: MetricPeriod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('companyId') companyId?: string,
  ) {
    const query: BusinessMetricQueryDto = {
      page,
      limit,
      type,
      period,
      startDate,
      endDate,
      companyId,
    };
    return this.adminService.getBusinessMetrics(query);
  }

  // ===== GLOBAL METRICS & DASHBOARD =====

  @Get('dashboard/global-metrics')
  @ApiOperation({ summary: 'Get global system metrics' })
  @ApiResponse({ status: 200, description: 'Global metrics retrieved successfully' })
  async getGlobalMetrics() {
    return this.adminService.getGlobalMetrics();
  }

  @Get('dashboard/system-health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health retrieved successfully' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }
}
