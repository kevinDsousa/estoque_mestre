/**
 * MinIO Configuration
 */

import { registerAs } from '@nestjs/config';

export default registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  bucketName: process.env.MINIO_BUCKET_NAME || 'estoque-mestre',
  region: process.env.MINIO_REGION || 'us-east-1',
  
  // Image processing settings
  imageProcessing: {
    enableAutoResize: process.env.MINIO_ENABLE_AUTO_RESIZE === 'true',
    defaultVariants: ['thumbnail', 'small', 'medium', 'large'],
    maxFileSize: parseInt(process.env.MINIO_MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedFormats: ['JPEG', 'PNG', 'WEBP', 'GIF', 'SVG'],
    quality: {
      thumbnail: parseInt(process.env.MINIO_THUMBNAIL_QUALITY || '80', 10),
      small: parseInt(process.env.MINIO_SMALL_QUALITY || '85', 10),
      medium: parseInt(process.env.MINIO_MEDIUM_QUALITY || '90', 10),
      large: parseInt(process.env.MINIO_LARGE_QUALITY || '95', 10),
    },
    sizes: {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
    },
  },
  
  // Storage settings
  storage: {
    retentionDays: parseInt(process.env.MINIO_RETENTION_DAYS || '365', 10),
    autoCleanup: process.env.MINIO_AUTO_CLEANUP === 'true',
    backupEnabled: process.env.MINIO_BACKUP_ENABLED === 'true',
  },
  
  // Security settings
  security: {
    presignedUrlExpiry: parseInt(process.env.MINIO_PRESIGNED_URL_EXPIRY || '3600', 10), // 1 hour
    maxUploadSize: parseInt(process.env.MINIO_MAX_UPLOAD_SIZE || '52428800', 10), // 50MB
  },
}));
