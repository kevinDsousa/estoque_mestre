import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';

export type LoadingType = 'spinner' | 'skeleton' | 'dots' | 'pulse';
export type LoadingSize = 'small' | 'medium' | 'large';

export interface EstoqueLoadingInputs {
  type: LoadingType;
  size: LoadingSize;
  message?: string;
  overlay: boolean;
  fullscreen: boolean;
  showMessage: boolean;
}

/**
 * Componente de loading para Estoque Mestre
 * 
 * Componente padronizado para estados de carregamento
 * 
 * @example
 * ```html
 * <estoque-loading 
 *   type="spinner"
 *   size="medium"
 *   message="Carregando dados..."
 *   [overlay]="true">
 * </estoque-loading>
 * ```
 */
@Component({
  selector: 'estoque-loading',
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    SkeletonModule
  ],
  templateUrl: './estoque-loading.component.html',
  styleUrls: ['./estoque-loading.component.scss']
})
export class EstoqueLoadingComponent implements EstoqueLoadingInputs {
  @Input() type: LoadingType = 'spinner';
  @Input() size: LoadingSize = 'medium';
  @Input() message?: string;
  @Input() overlay: boolean = false;
  @Input() fullscreen: boolean = false;
  @Input() showMessage: boolean = true;

  getSpinnerSize(): string {
    switch (this.size) {
      case 'small':
        return '30px';
      case 'large':
        return '60px';
      default:
        return '40px';
    }
  }

  getSkeletonHeight(): string {
    switch (this.size) {
      case 'small':
        return '1rem';
      case 'large':
        return '2rem';
      default:
        return '1.5rem';
    }
  }

  getLoadingClass(): string {
    const classes = ['estoque-loading'];
    
    if (this.overlay) classes.push('overlay');
    if (this.fullscreen) classes.push('fullscreen');
    if (this.type) classes.push(`type-${this.type}`);
    if (this.size) classes.push(`size-${this.size}`);
    
    return classes.join(' ');
  }
}
