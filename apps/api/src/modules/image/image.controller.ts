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
  UseInterceptors,
  UploadedFile,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { ImageService } from './image.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ImageQueryDto } from './dto/image-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: any,
    @Body() uploadImageDto: UploadImageDto,
    @Request() req: any,
  ) {
    return this.imageService.uploadImage(
      file,
      uploadImageDto,
      req.user.companyId,
      req.user.id,
    );
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate presigned upload URL' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  async generatePresignedUploadUrl(
    @Body() body: { fileName: string; mimeType: string },
    @Request() req: any,
  ) {
    return this.imageService.generatePresignedUploadUrl(
      body.fileName,
      body.mimeType,
      req.user.companyId,
      req.user.id,
    );
  }

  @Post('confirm-upload')
  @ApiOperation({ summary: 'Confirm upload using presigned URL' })
  @ApiResponse({ status: 201, description: 'Upload confirmed successfully' })
  async confirmUpload(
    @Body() body: { objectName: string; uploadData: UploadImageDto },
    @Request() req: any,
  ) {
    return this.imageService.confirmUpload(
      body.objectName,
      body.uploadData,
      req.user.companyId,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all images with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  async findAll(@Query() query: ImageQueryDto, @Request() req: any) {
    return this.imageService.findAll(req.user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get image statistics' })
  @ApiResponse({ status: 200, description: 'Image statistics retrieved successfully' })
  async getStats(@Request() req: any) {
    return this.imageService.getImageStats(req.user.companyId);
  }

  @Get('entity/:entityId/:type')
  @ApiOperation({ summary: 'Get images by entity ID and type' })
  @ApiResponse({ status: 200, description: 'Entity images retrieved successfully' })
  async findByEntity(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Param('type') type: string,
    @Request() req: any,
  ) {
    return this.imageService.findByEntity(entityId, type as any, req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image by ID' })
  @ApiResponse({ status: 200, description: 'Image retrieved successfully' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.imageService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update image metadata' })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateImageDto: UpdateImageDto,
    @Request() req: any,
  ) {
    return this.imageService.update(id, updateImageDto, req.user.companyId);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Delete image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.imageService.remove(id, req.user.companyId);
  }
}
