import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('minio.endpoint') || 'localhost',
      port: this.configService.get('minio.port') || 9000,
      useSSL: this.configService.get('minio.useSSL') || false,
      accessKey: this.configService.get('minio.accessKey') || 'minioadmin',
      secretKey: this.configService.get('minio.secretKey') || 'minioadmin',
    });

    this.bucketName = this.configService.get('minio.bucketName') || 'estoque-mestre';
  }

  async onModuleInit() {
    try {
      // Check if bucket exists, create if not
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`Bucket ${this.bucketName} created successfully`);
      }
    } catch (error) {
      console.error('Error initializing MinIO:', error);
      throw new InternalServerErrorException('Failed to initialize MinIO service');
    }
  }

  async uploadFile(
    file: any,
    folder: string = 'uploads',
    customName?: string,
  ): Promise<{ url: string; key: string; size: number }> {
    try {
      const fileName = customName || `${Date.now()}-${file.originalname}`;
      const objectName = `${folder}/${fileName}`;

      const metaData = {
        'Content-Type': file.mimetype,
        'Original-Name': file.originalname,
        'Upload-Date': new Date().toISOString(),
      };

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        metaData,
      );

      const url = await this.getFileUrl(objectName);

      return {
        url,
        key: objectName,
        size: file.size,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string; size: number }> {
    try {
      const objectName = `${folder}/${fileName}`;

      const metaData = {
        'Content-Type': mimeType,
        'Upload-Date': new Date().toISOString(),
      };

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        buffer,
        buffer.length,
        metaData,
      );

      const url = await this.getFileUrl(objectName);

      return {
        url,
        key: objectName,
        size: buffer.length,
      };
    } catch (error) {
      console.error('Error uploading buffer:', error);
      throw new InternalServerErrorException('Failed to upload buffer');
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async getFileUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, objectName, expiry);
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw new InternalServerErrorException('Failed to get file URL');
    }
  }

  async getFileInfo(objectName: string): Promise<Minio.BucketItemStat> {
    try {
      return await this.minioClient.statObject(this.bucketName, objectName);
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new InternalServerErrorException('Failed to get file info');
    }
  }

  async listFiles(prefix: string = '', recursive: boolean = true): Promise<Minio.BucketItem[]> {
    try {
      const objectsList: Minio.BucketItem[] = [];
      const stream = this.minioClient.listObjects(this.bucketName, prefix, recursive);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => objectsList.push(obj));
        stream.on('error', reject);
        stream.on('end', () => resolve(objectsList));
      });
    } catch (error) {
      console.error('Error listing files:', error);
      throw new InternalServerErrorException('Failed to list files');
    }
  }

  async copyFile(sourceObjectName: string, destObjectName: string): Promise<void> {
    try {
      const conditions = new Minio.CopyConditions();
      await this.minioClient.copyObject(
        this.bucketName,
        destObjectName,
        `/${this.bucketName}/${sourceObjectName}`,
        conditions,
      );
    } catch (error) {
      console.error('Error copying file:', error);
      throw new InternalServerErrorException('Failed to copy file');
    }
  }

  async generatePresignedUploadUrl(
    objectName: string,
    expiry: number = 60 * 60, // 1 hour
  ): Promise<string> {
    try {
      return await this.minioClient.presignedPutObject(this.bucketName, objectName, expiry);
    } catch (error) {
      console.error('Error generating presigned upload URL:', error);
      throw new InternalServerErrorException('Failed to generate presigned upload URL');
    }
  }

  async getBucketStats(): Promise<{ totalObjects: number; totalSize: number }> {
    try {
      const objects = await this.listFiles();
      const totalObjects = objects.length;
      const totalSize = objects.reduce((sum, obj) => sum + (obj.size || 0), 0);

      return { totalObjects, totalSize };
    } catch (error) {
      console.error('Error getting bucket stats:', error);
      throw new InternalServerErrorException('Failed to get bucket stats');
    }
  }

  // Image processing helpers
  async resizeImage(
    buffer: Buffer,
    width: number,
    height: number,
    quality: number = 80,
  ): Promise<Buffer> {
    // This would typically use sharp or similar library
    // For now, return the original buffer
    // TODO: Implement actual image resizing
    return buffer;
  }

  async generateThumbnail(
    buffer: Buffer,
    size: number = 200,
  ): Promise<Buffer> {
    // This would typically use sharp or similar library
    // For now, return the original buffer
    // TODO: Implement actual thumbnail generation
    return buffer;
  }

  async validateImageFile(file: any): Promise<boolean> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB.');
    }

    return true;
  }

  async validateFileType(file: any, allowedTypes: string[]): Promise<boolean> {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return true;
  }
}
