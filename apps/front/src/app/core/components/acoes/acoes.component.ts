import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Acao {
  label: string;
  icon: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  tooltip?: string;
  action: () => void;
}

@Component({
  selector: 'app-acoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acoes.component.html',
  styleUrl: './acoes.component.scss'
})
export class AcoesComponent {
  @Input() acoes: Acao[] = [];
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Input() spacing: 'tight' | 'normal' | 'loose' = 'normal';
  @Input() align: 'left' | 'center' | 'right' = 'center';
  @Input() showLabels: boolean = true;
  @Input() maxVisible: number = 0; // 0 = mostrar todas

  get visibleAcoes(): Acao[] {
    if (this.maxVisible > 0 && this.acoes.length > this.maxVisible) {
      return this.acoes.slice(0, this.maxVisible);
    }
    return this.acoes;
  }

  get hasMoreAcoes(): boolean {
    return this.maxVisible > 0 && this.acoes.length > this.maxVisible;
  }

  get remainingAcoes(): Acao[] {
    if (this.hasMoreAcoes) {
      return this.acoes.slice(this.maxVisible);
    }
    return [];
  }

  onAcaoClick(acao: Acao): void {
    if (!acao.disabled) {
      acao.action();
    }
  }

  getAcaoClass(acao: Acao): string {
    const classes = ['btn', `btn-${acao.variant || 'secondary'}`, `btn-${acao.size || 'sm'}`];
    
    if (acao.disabled) {
      classes.push('disabled');
    }
    
    return classes.join(' ');
  }

  getContainerClass(): string {
    const classes = ['acoes-container', `layout-${this.layout}`, `spacing-${this.spacing}`, `align-${this.align}`];
    return classes.join(' ');
  }

  trackByLabel(index: number, acao: Acao): string {
    return acao.label;
  }
}
