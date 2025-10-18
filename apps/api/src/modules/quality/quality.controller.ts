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
import { QualityService } from './quality.service';
import { CreateQualityInspectionDto } from './dto/create-quality-inspection.dto';
import { UpdateQualityInspectionDto } from './dto/update-quality-inspection.dto';
import { QualityInspectionQueryDto } from './dto/quality-inspection-query.dto';
import { CreateProductBatchDto, UpdateProductBatchDto, BatchQualityStatusDto } from './dto/batch-quality.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles } from '../../common/guards/role.guard';
import { UserRole, QualityStatus } from '@prisma/client';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('quality')
@Controller('quality')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  // ===== QUALITY INSPECTIONS =====

  @Post('inspections')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new quality inspection' })
  @ApiResponse({ status: 201, description: 'Quality inspection created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product or inspector not found' })
  @ApiResponse({ status: 409, description: 'Inspection already exists for this batch' })
  async createInspection(
    @Body() createInspectionDto: CreateQualityInspectionDto,
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    return this.qualityService.createInspection(createInspectionDto, companyId, userId);
  }

  @Get('inspections')
  @ApiOperation({ summary: 'Get all quality inspections with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Quality inspections retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'productId', required: false, type: String, description: 'Filter by product ID' })
  @ApiQuery({ name: 'batchNumber', required: false, type: String, description: 'Filter by batch number' })
  @ApiQuery({ name: 'inspectorId', required: false, type: String, description: 'Filter by inspector ID' })
  @ApiQuery({ name: 'status', required: false, enum: QualityStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by text' })
  async findAllInspections(
    @User('companyId') companyId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('productId') productId?: string,
    @Query('batchNumber') batchNumber?: string,
    @Query('inspectorId') inspectorId?: string,
    @Query('status', new DefaultValuePipe(undefined), new ParseEnumPipe(QualityStatus, { optional: true })) status?: QualityStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    const query: QualityInspectionQueryDto = {
      page,
      limit,
      productId,
      batchNumber,
      inspectorId,
      status,
      startDate,
      endDate,
      search,
    };
    return this.qualityService.findAllInspections(query, companyId);
  }

  @Get('inspections/:id')
  @ApiOperation({ summary: 'Get quality inspection by ID' })
  @ApiResponse({ status: 200, description: 'Quality inspection retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quality inspection not found' })
  @ApiParam({ name: 'id', description: 'Quality inspection ID' })
  async findOneInspection(
    @Param('id') id: string,
    @User('companyId') companyId: string,
  ) {
    return this.qualityService.findOneInspection(id, companyId);
  }

  @Patch('inspections/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Update a quality inspection' })
  @ApiResponse({ status: 200, description: 'Quality inspection updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Quality inspection not found' })
  @ApiParam({ name: 'id', description: 'Quality inspection ID' })
  async updateInspection(
    @Param('id') id: string,
    @Body() updateInspectionDto: UpdateQualityInspectionDto,
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    return this.qualityService.updateInspection(id, updateInspectionDto, companyId, userId);
  }

  @Delete('inspections/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a quality inspection' })
  @ApiResponse({ status: 200, description: 'Quality inspection deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quality inspection not found' })
  @ApiParam({ name: 'id', description: 'Quality inspection ID' })
  async removeInspection(
    @Param('id') id: string,
    @User('companyId') companyId: string,
  ) {
    return this.qualityService.removeInspection(id, companyId);
  }

  @Post('inspections/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Approve a quality inspection' })
  @ApiResponse({ status: 200, description: 'Quality inspection approved successfully' })
  @ApiResponse({ status: 400, description: 'Inspection is already approved' })
  @ApiResponse({ status: 404, description: 'Quality inspection not found' })
  @ApiParam({ name: 'id', description: 'Quality inspection ID' })
  async approveInspection(
    @Param('id') id: string,
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    return this.qualityService.approveInspection(id, companyId, userId);
  }

  @Post('inspections/:id/reject')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Reject a quality inspection' })
  @ApiResponse({ status: 200, description: 'Quality inspection rejected successfully' })
  @ApiResponse({ status: 400, description: 'Inspection is already rejected' })
  @ApiResponse({ status: 404, description: 'Quality inspection not found' })
  @ApiParam({ name: 'id', description: 'Quality inspection ID' })
  async rejectInspection(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    return this.qualityService.rejectInspection(id, companyId, userId, body.reason);
  }

  // ===== PRODUCT BATCHES =====

  @Post('batches')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new product batch' })
  @ApiResponse({ status: 201, description: 'Product batch created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product or supplier not found' })
  @ApiResponse({ status: 409, description: 'Batch number already exists for this product' })
  async createBatch(
    @Body() createBatchDto: CreateProductBatchDto,
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    return this.qualityService.createBatch(createBatchDto, companyId, userId);
  }

  @Get('batches')
  @ApiOperation({ summary: 'Get all product batches with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Product batches retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'productId', required: false, type: String, description: 'Filter by product ID' })
  @ApiQuery({ name: 'batchNumber', required: false, type: String, description: 'Filter by batch number' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by text' })
  async findAllBatches(
    @User('companyId') companyId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('productId') productId?: string,
    @Query('batchNumber') batchNumber?: string,
    @Query('search') search?: string,
  ) {
    const query: QualityInspectionQueryDto = {
      page,
      limit,
      productId,
      batchNumber,
      search,
    };
    return this.qualityService.findAllBatches(query, companyId);
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'Get product batch by ID' })
  @ApiResponse({ status: 200, description: 'Product batch retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product batch not found' })
  @ApiParam({ name: 'id', description: 'Product batch ID' })
  async findOneBatch(
    @Param('id') id: string,
    @User('companyId') companyId: string,
  ) {
    return this.qualityService.findOneBatch(id, companyId);
  }

  @Patch('batches/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Update a product batch' })
  @ApiResponse({ status: 200, description: 'Product batch updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product batch not found' })
  @ApiParam({ name: 'id', description: 'Product batch ID' })
  async updateBatch(
    @Param('id') id: string,
    @Body() updateBatchDto: UpdateProductBatchDto,
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    return this.qualityService.updateBatch(id, updateBatchDto, companyId, userId);
  }

  @Delete('batches/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a product batch' })
  @ApiResponse({ status: 200, description: 'Product batch deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product batch not found' })
  @ApiParam({ name: 'id', description: 'Product batch ID' })
  async removeBatch(
    @Param('id') id: string,
    @User('companyId') companyId: string,
  ) {
    return this.qualityService.removeBatch(id, companyId);
  }

  @Patch('batches/:id/quality-status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update batch quality status' })
  @ApiResponse({ status: 200, description: 'Batch quality status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product batch not found' })
  @ApiParam({ name: 'id', description: 'Product batch ID' })
  async updateBatchQualityStatus(
    @Param('id') id: string,
    @Body() batchQualityDto: BatchQualityStatusDto,
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    // Override the batchId from the URL parameter
    batchQualityDto.batchId = id;
    return this.qualityService.updateBatchQualityStatusPublic(batchQualityDto, companyId, userId);
  }

  // ===== QUALITY STATISTICS =====

  @Get('stats')
  @ApiOperation({ summary: 'Get quality statistics' })
  @ApiResponse({ status: 200, description: 'Quality statistics retrieved successfully' })
  async getQualityStats(@User('companyId') companyId: string) {
    return this.qualityService.getQualityStats(companyId);
  }
}
