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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { LocationStatsDto } from './dto/location-stats.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LocationType, UserRole } from '@prisma/client';
import { User } from '../../common/decorators/user.decorator';
import { AuthContext } from '../../common/decorators/auth-context.decorator';
import { RoleGuard, Roles } from '../../common/guards/role.guard';

@ApiTags('locations')
@Controller('locations')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Location code already exists' })
  async create(
    @Body() createLocationDto: CreateLocationDto,
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    return this.locationService.create(createLocationDto, companyId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: LocationType, description: 'Filter by location type' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'parentId', required: false, type: String, description: 'Filter by parent location' })
  async findAll(
    @User('companyId') companyId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: LocationType,
    @Query('isActive') isActive?: boolean,
    @Query('parentId') parentId?: string,
  ) {
    return this.locationService.findAll(companyId, page, limit, type, isActive, parentId);
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get location hierarchy tree' })
  @ApiResponse({ status: 200, description: 'Location hierarchy retrieved successfully' })
  async getHierarchy(@User('companyId') companyId: string) {
    return this.locationService.getLocationHierarchy(companyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get location statistics' })
  @ApiResponse({ status: 200, description: 'Location statistics retrieved successfully', type: LocationStatsDto })
  async getStats(
    @User('companyId') companyId: string,
    @AuthContext() authContext: any,
  ): Promise<LocationStatsDto> {
    // Example of using AuthContext decorator
    console.log('User accessing stats:', authContext?.userId, authContext?.role);
    return this.locationService.getLocationStats(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiResponse({ status: 200, description: 'Location retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  async findOne(
    @Param('id') id: string,
    @User('companyId') companyId: string,
  ) {
    return this.locationService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 409, description: 'Location code already exists' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    return this.locationService.update(id, updateLocationDto, companyId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete location' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete location with children or stock' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  async remove(
    @Param('id') id: string,
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    return this.locationService.remove(id, companyId, userId);
  }

  @Post('transfer-stock')
  @ApiOperation({ summary: 'Transfer stock between locations' })
  @ApiResponse({ status: 200, description: 'Stock transferred successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - insufficient stock or capacity exceeded' })
  @ApiResponse({ status: 404, description: 'Source or destination location not found' })
  async transferStock(
    @Body() transferStockDto: TransferStockDto,
    @User('companyId') companyId: string,
    @User('userId') userId: string,
  ) {
    return this.locationService.transferStock(transferStockDto, companyId, userId);
  }
}
