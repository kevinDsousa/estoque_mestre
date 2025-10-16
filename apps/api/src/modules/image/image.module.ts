import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { MinioModule } from '../minio/minio.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, MinioModule],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
