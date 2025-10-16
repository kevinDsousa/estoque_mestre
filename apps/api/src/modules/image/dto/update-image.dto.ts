import { PartialType } from '@nestjs/swagger';
import { UploadImageDto } from './upload-image.dto';

export class UpdateImageDto extends PartialType(UploadImageDto) {}
