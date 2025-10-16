import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MinioService } from '../minio/minio.service';
import { UploadImageDto, ImageType } from './dto/upload-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ImageQueryDto } from './dto/image-query.dto';

@Injectable()
export class ImageService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  async uploadImage(
    file: any,
    uploadImageDto: UploadImageDto,
    companyId: string,
    userId: string,
  ) {
    // Validate image file
    await this.minioService.validateImageFile(file);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uploadImageDto.type}-${timestamp}-${randomString}.${fileExtension}`;

    // Upload to MinIO
    const uploadResult = await this.minioService.uploadFile(
      file,
      `images/${uploadImageDto.type}`,
      fileName,
    );

    // Save to database
    const image = await this.prisma.image.create({
      data: {
        url: uploadResult.url,
        type: uploadImageDto.type as any,
        entityId: uploadImageDto.entityId,
        entityType: uploadImageDto.type,
        metadata: {
          originalName: file.originalname,
          fileName: fileName,
          mimeType: file.mimetype,
          size: uploadResult.size,
          description: uploadImageDto.description,
        },
        variants: {},
        tags: uploadImageDto.tags ? uploadImageDto.tags.split(',').map(tag => tag.trim()) : [],
        isPublic: uploadImageDto.isPublic || false,
        companyId,
        uploadedBy: userId,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        uploadedByUser: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });


    return image;
  }

  async findAll(companyId: string, query: ImageQueryDto) {
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    
    const where: any = { companyId };
    
    if (query.type) where.type = query.type as any;
    if (query.entityId) where.entityId = query.entityId;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;
    if (query.search) {
      where.OR = [
        { tags: { has: query.search } },
      ];
    }
    
    const [images, total] = await Promise.all([
      this.prisma.image.findMany({
        where,
        skip,
        take: query.limit || 20,
        orderBy: [
          { createdAt: 'desc' },
        ],
        include: {
          company: {
            select: { id: true, name: true },
          },
          uploadedByUser: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.image.count({ where }),
    ]);

    return {
      images,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        totalPages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const image = await this.prisma.image.findFirst({
      where: { id, companyId },
      include: {
        company: {
          select: { id: true, name: true },
        },
        uploadedByUser: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  async findByEntity(entityId: string, type: ImageType, companyId: string) {
    const images = await this.prisma.image.findMany({
      where: {
        entityId,
        type: type as any,
        companyId,
      },
      orderBy: [
        { createdAt: 'asc' },
      ],
      include: {
        company: {
          select: { id: true, name: true },
        },
        uploadedByUser: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    return images;
  }

  async update(id: string, updateImageDto: UpdateImageDto, companyId: string) {
    const image = await this.findOne(id, companyId);

    const updatedImage = await this.prisma.image.update({
      where: { id },
      data: {
        isPublic: updateImageDto.isPublic,
        tags: updateImageDto.tags ? updateImageDto.tags.split(',').map(tag => tag.trim()) : undefined,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        uploadedByUser: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });


    return updatedImage;
  }

  async remove(id: string, companyId: string) {
    const image = await this.findOne(id, companyId);

    // Delete from MinIO
    try {
      const metadata = image.metadata as any;
      if (metadata?.fileName) {
        await this.minioService.deleteFile(`images/${image.type}/${metadata.fileName}`);
      }
    } catch (error) {
      console.error('Error deleting file from MinIO:', error);
      // Continue with database deletion even if MinIO deletion fails
    }

    // Delete from database
    return this.prisma.image.delete({
      where: { id },
    });
  }


  async getImageStats(companyId: string) {
    const [
      totalImages,
      byType,
      totalSize,
      recentUploads,
    ] = await Promise.all([
      this.prisma.image.count({ where: { companyId } }),
      this.prisma.image.groupBy({
        by: ['type'],
        where: { companyId },
        _count: { type: true },
      }),
      this.prisma.image.count({
        where: { companyId },
      }),
      this.prisma.image.count({
        where: {
          companyId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      totalImages,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {}),
      totalSize: totalSize,
      recentUploads,
    };
  }

  async generatePresignedUploadUrl(
    fileName: string,
    mimeType: string,
    companyId: string,
    userId: string,
  ) {
    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `temp-${timestamp}-${randomString}.${fileExtension}`;
    const objectName = `temp/${uniqueFileName}`;

    const presignedUrl = await this.minioService.generatePresignedUploadUrl(objectName);

    return {
      presignedUrl,
      objectName,
      expiresIn: 3600, // 1 hour
    };
  }

  async confirmUpload(
    objectName: string,
    uploadImageDto: UploadImageDto,
    companyId: string,
    userId: string,
  ) {
    // Get file info from MinIO
    const fileInfo = await this.minioService.getFileInfo(objectName);

    // Generate final filename and move file
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = objectName.split('.').pop();
    const finalFileName = `${uploadImageDto.type}-${timestamp}-${randomString}.${fileExtension}`;
    const finalObjectName = `images/${uploadImageDto.type}/${finalFileName}`;

    // Copy file to final location
    await this.minioService.copyFile(objectName, finalObjectName);

    // Delete temporary file
    await this.minioService.deleteFile(objectName);

    // Get final URL
    const finalUrl = await this.minioService.getFileUrl(finalObjectName);

    // Save to database
    const image = await this.prisma.image.create({
      data: {
        url: finalUrl,
        type: uploadImageDto.type as any,
        entityId: uploadImageDto.entityId,
        entityType: uploadImageDto.type,
        metadata: {
          originalName: finalFileName,
          fileName: finalFileName,
          mimeType: fileInfo.metaData['content-type'] || 'application/octet-stream',
          size: fileInfo.size,
          description: uploadImageDto.description,
        },
        variants: {},
        tags: uploadImageDto.tags ? uploadImageDto.tags.split(',').map(tag => tag.trim()) : [],
        isPublic: uploadImageDto.isPublic || false,
        companyId,
        uploadedBy: userId,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
        uploadedByUser: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    return image;
  }
}
