import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';

export interface UploadedImage {
  id: string;
  file: File;
  url: string;
  isPrimary: boolean;
  order: number;
  uploading: boolean;
  error?: string;
}

export type ImageUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface EstoqueImageUploadInputs {
  maxFiles: number;
  maxFileSize: number;
  acceptedTypes: string[];
  disabled: boolean;
  autoUpload: boolean;
}

export interface EstoqueImageUploadOutputs {
  onUpload: EventEmitter<UploadedImage[]>;
  onReorder: EventEmitter<UploadedImage[]>;
  onError: EventEmitter<string>;
}

/**
 * Componente de upload de imagens com drag & drop para Estoque Mestre
 * 
 * Suporta múltiplas imagens, preview, reordenação e definição de imagem principal
 * 
 * @example
 * ```html
 * <estoque-image-upload 
 *   [maxFiles]="5"
 *   [maxFileSize]="10485760"
 *   [acceptedTypes]="['image/jpeg', 'image/png']"
 *   [(ngModel)]="images"
 *   (onUpload)="onImageUpload($event)"
 *   (onReorder)="onImageReorder($event)">
 * </estoque-image-upload>
 * ```
 */
@Component({
  selector: 'estoque-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadModule,
    ButtonModule,
    ImageModule,
    DialogModule,
    ProgressBarModule,
    MessageModule
  ],
  templateUrl: './estoque-image-upload.component.html',
  styleUrls: ['./estoque-image-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EstoqueImageUploadComponent),
      multi: true
    }
  ]
})
export class EstoqueImageUploadComponent implements ControlValueAccessor, EstoqueImageUploadInputs, EstoqueImageUploadOutputs {
  @Input() maxFiles: number = 5;
  @Input() maxFileSize: number = 10485760; // 10MB
  @Input() acceptedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'];
  @Input() disabled: boolean = false;
  @Input() autoUpload: boolean = false;

  @Output() onUpload = new EventEmitter<UploadedImage[]>();
  @Output() onReorder = new EventEmitter<UploadedImage[]>();
  @Output() onError = new EventEmitter<string>();

  images: UploadedImage[] = [];
  isDragOver: boolean = false;
  isUploading: boolean = false;
  uploadProgress: number = 0;

  // ControlValueAccessor implementation
  private _onChange = (value: UploadedImage[]) => {};
  private _onTouched = () => {};

  get primaryImage(): UploadedImage | undefined {
    return this.images.find(img => img.isPrimary);
  }

  get uploadingCount(): number {
    return this.images.filter(img => img.uploading).length;
  }

  writeValue(value: UploadedImage[]): void {
    this.images = value || [];
  }

  registerOnChange(fn: (value: UploadedImage[]) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (this.disabled) return;

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onFileSelect(event: any): void {
    const files = Array.from(event.files || []) as File[];
    this.handleFiles(files);
  }

  private handleFiles(files: File[]): void {
    if (this.images.length + files.length > this.maxFiles) {
      this.onError.emit(`Máximo de ${this.maxFiles} imagens permitidas`);
      return;
    }

    files.forEach(file => {
      if (!this.acceptedTypes.includes(file.type)) {
        this.onError.emit(`Tipo de arquivo não suportado: ${file.type}`);
        return;
      }

      if (file.size > this.maxFileSize) {
        this.onError.emit(`Arquivo muito grande: ${this.formatFileSize(file.size)}`);
        return;
      }

      const image: UploadedImage = {
        id: this.generateId(),
        file,
        url: URL.createObjectURL(file),
        isPrimary: this.images.length === 0, // First image is primary
        order: this.images.length,
        uploading: false
      };

      this.images.push(image);
    });

    this.updateValue();
  }

  setAsPrimary(imageId: string): void {
    this.images.forEach(img => {
      img.isPrimary = img.id === imageId;
    });
    this.updateValue();
  }

  moveImage(imageId: string, direction: 'up' | 'down'): void {
    const index = this.images.findIndex(img => img.id === imageId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.images.length) return;

    // Swap images
    [this.images[index], this.images[newIndex]] = [this.images[newIndex], this.images[index]];
    
    // Update order
    this.images.forEach((img, i) => {
      img.order = i;
    });

    this.updateValue();
    this.onReorder.emit(this.images);
  }

  removeImage(imageId: string): void {
    const index = this.images.findIndex(img => img.id === imageId);
    if (index === -1) return;

    const image = this.images[index];
    URL.revokeObjectURL(image.url);
    this.images.splice(index, 1);

    // Update order
    this.images.forEach((img, i) => {
      img.order = i;
    });

    // If removed image was primary, make first image primary
    if (image.isPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }

    this.updateValue();
  }

  clearAllImages(): void {
    this.images.forEach(img => {
      URL.revokeObjectURL(img.url);
    });
    this.images = [];
    this.updateValue();
  }

  private updateValue(): void {
    this._onChange(this.images);
    this._onTouched();
    this.onUpload.emit(this.images);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getAcceptedFormats(): string {
    return this.acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
  }

  trackByImageId(index: number, image: UploadedImage): string {
    return image.id;
  }

  onUploadError(event: any): void {
    this.onError.emit('Erro no upload: ' + event.error);
  }
}