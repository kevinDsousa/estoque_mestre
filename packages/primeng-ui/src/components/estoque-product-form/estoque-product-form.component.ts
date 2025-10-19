import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { EstoqueImageUploadComponent } from '../estoque-image-upload/estoque-image-upload.component';

export interface ProductFormData {
  // Dados básicos
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  
  // Categorização
  categoryId: string;
  brand?: string;
  model?: string;
  
  // Preços
  costPrice: number;
  sellingPrice: number;
  
  // Estoque
  currentStock: number;
  minStock: number;
  maxStock?: number;
  
  // Status
  isActive: boolean;
  isLowStock: boolean;
  
  // Imagens
  images: any[];
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  children?: Category[];
}

export interface EstoqueProductFormInputs {
  categories: Category[];
  loading: boolean;
  disabled: boolean;
  showImages: boolean;
  showAdvancedFields: boolean;
}

export interface EstoqueProductFormOutputs {
  onSubmit: EventEmitter<ProductFormData>;
  onCancel: EventEmitter<void>;
  onImageUpload: EventEmitter<any[]>;
}

/**
 * Formulário de produto para Estoque Mestre
 * 
 * Componente completo para criação e edição de produtos com validações,
 * upload de imagens e campos organizados por seções
 * 
 * @example
 * ```html
 * <estoque-product-form 
 *   [categories]="categories"
 *   [loading]="false"
 *   [showImages]="true"
 *   [(ngModel)]="productData"
 *   (onSubmit)="onProductSubmit($event)"
 *   (onCancel)="onCancel()">
 * </estoque-product-form>
 * ```
 */
@Component({
  selector: 'estoque-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextarea,
    InputNumberModule,
    DropdownModule,
    CheckboxModule,
    ButtonModule,
    CardModule,
    DividerModule,
    MessageModule,
    EstoqueImageUploadComponent
  ],
  templateUrl: './estoque-product-form.component.html',
  styleUrls: ['./estoque-product-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EstoqueProductFormComponent),
      multi: true
    }
  ]
})
export class EstoqueProductFormComponent implements ControlValueAccessor, EstoqueProductFormInputs, EstoqueProductFormOutputs {
  @Input() categories: Category[] = [];
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showImages: boolean = true;
  @Input() showAdvancedFields: boolean = false;

  @Output() onSubmit = new EventEmitter<ProductFormData>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onImageUpload = new EventEmitter<any[]>();

  productForm: FormGroup;
  currentStep: number = 1;
  totalSteps: number = 4;

  // ControlValueAccessor implementation
  private _onChange = (value: ProductFormData) => {};
  private _onTouched = () => {};

  constructor(private fb: FormBuilder) {
    this.productForm = this.createForm();
    this.setupFormSubscription();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Dados básicos
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      sku: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      barcode: ['', [Validators.maxLength(50)]],
      
      // Categorização
      categoryId: ['', [Validators.required]],
      brand: ['', [Validators.maxLength(50)]],
      model: ['', [Validators.maxLength(50)]],
      
      // Preços
      costPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      
      // Estoque
      currentStock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      maxStock: [null, [Validators.min(0)]],
      
      // Status
      isActive: [true],
      isLowStock: [false],
      
      // Imagens
      images: [[]]
    });
  }

  private setupFormSubscription(): void {
    this.productForm.valueChanges.subscribe(value => {
      this._onChange(value);
      this._onTouched();
    });
  }

  writeValue(value: ProductFormData): void {
    if (value) {
      this.productForm.patchValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: ProductFormData) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.productForm.disable();
    } else {
      this.productForm.enable();
    }
  }

  // Step Navigation
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  // Form Actions
  submitForm(): void {
    if (this.productForm.valid) {
      const formData = this.productForm.value as ProductFormData;
      this.onSubmit.emit(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  cancelForm(): void {
    this.onCancel.emit();
  }

  resetForm(): void {
    this.productForm.reset();
    this.currentStep = 1;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  // Image Upload
  onImageUploadHandler(images: any[]): void {
    this.productForm.patchValue({ images });
    this.onImageUpload.emit(images);
  }

  // Validation Helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} é obrigatório`;
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    }
    return '';
  }

  // Step Validation
  isStepValid(step: number): boolean {
    switch (step) {
      case 1: // Dados básicos
        return !!(this.productForm.get('name')?.valid && 
               this.productForm.get('sku')?.valid && 
               this.productForm.get('categoryId')?.valid);
      case 2: // Preços
        return !!(this.productForm.get('costPrice')?.valid && 
               this.productForm.get('sellingPrice')?.valid);
      case 3: // Estoque
        return !!(this.productForm.get('currentStock')?.valid && 
               this.productForm.get('minStock')?.valid);
      case 4: // Imagens (opcional)
        return true;
      default:
        return false;
    }
  }

  // Getters
  get formData(): ProductFormData {
    return this.productForm.value;
  }

  get isFormValid(): boolean {
    return this.productForm.valid;
  }

  get canGoNext(): boolean {
    return this.currentStep < this.totalSteps && this.isStepValid(this.currentStep);
  }

  get canGoPrevious(): boolean {
    return this.currentStep > 1;
  }

  get canSubmit(): boolean {
    return this.currentStep === this.totalSteps && this.isFormValid;
  }

  calculateProfitMargin(): number {
    const costPrice = this.productForm.get('costPrice')?.value || 0;
    const sellingPrice = this.productForm.get('sellingPrice')?.value || 0;
    
    if (costPrice === 0) return 0;
    
    const margin = ((sellingPrice - costPrice) / costPrice) * 100;
    return Math.round(margin * 100) / 100; // Round to 2 decimal places
  }
}
