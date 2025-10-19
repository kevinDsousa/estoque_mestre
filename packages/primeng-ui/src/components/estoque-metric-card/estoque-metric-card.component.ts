import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

export interface MetricData {
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: string;
  trend?: number[];
  subtitle?: string;
  loading?: boolean;
}

export interface EstoqueMetricCardInputs {
  metric: MetricData;
  clickable: boolean;
  showTrend: boolean;
  showChange: boolean;
  size: 'small' | 'medium' | 'large';
  variant: 'default' | 'outlined' | 'elevated';
}

export interface EstoqueMetricCardOutputs {
  onClick: EventEmitter<MetricData>;
}

/**
 * Componente de card de métrica para Estoque Mestre
 * 
 * Card padronizado para exibir métricas e KPIs no dashboard
 * 
 * @example
 * ```html
 * <estoque-metric-card 
 *   [metric]="metricData"
 *   [clickable]="true"
 *   [showTrend]="true"
 *   (onClick)="onMetricClick($event)">
 * </estoque-metric-card>
 * ```
 */
@Component({
  selector: 'estoque-metric-card',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    TooltipModule
  ],
  templateUrl: './estoque-metric-card.component.html',
  styleUrls: ['./estoque-metric-card.component.scss']
})
export class EstoqueMetricCardComponent implements EstoqueMetricCardInputs, EstoqueMetricCardOutputs {
  @Input() metric: MetricData = {
    title: 'Métrica',
    value: 0,
    unit: '',
    change: 0,
    changeType: 'neutral',
    icon: 'pi pi-chart-line',
    color: 'primary'
  };
  @Input() clickable: boolean = false;
  @Input() showTrend: boolean = true;
  @Input() showChange: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'default' | 'outlined' | 'elevated' = 'default';

  @Output() onClick = new EventEmitter<MetricData>();

  onCardClick(): void {
    if (this.clickable) {
      this.onClick.emit(this.metric);
    }
  }

  getCardClass(): string {
    const classes = ['estoque-metric-card'];
    
    classes.push(`size-${this.size}`);
    classes.push(`variant-${this.variant}`);
    
    if (this.clickable) classes.push('clickable');
    if (this.metric.loading) classes.push('loading');
    
    return classes.join(' ');
  }

  getChangeClass(): string {
    if (!this.showChange || this.metric.change === undefined) return '';
    
    return `change-${this.metric.changeType || 'neutral'}`;
  }

  getChangeIcon(): string {
    switch (this.metric.changeType) {
      case 'increase':
        return 'pi pi-arrow-up';
      case 'decrease':
        return 'pi pi-arrow-down';
      default:
        return 'pi pi-minus';
    }
  }

  getChangeText(): string {
    if (this.metric.change === undefined) return '';
    
    const change = Math.abs(this.metric.change);
    const sign = this.metric.changeType === 'increase' ? '+' : 
                 this.metric.changeType === 'decrease' ? '-' : '';
    
    return `${sign}${change}%`;
  }

  formatValue(): string {
    if (typeof this.metric.value === 'number') {
      return new Intl.NumberFormat('pt-BR').format(this.metric.value);
    }
    return this.metric.value.toString();
  }

  getIconColor(): string {
    return this.metric.color || 'var(--p-primary-color)';
  }

  getTrendDirection(): string {
    if (!this.metric.trend || this.metric.trend.length < 2) return 'neutral';
    
    const first = this.metric.trend[0];
    const last = this.metric.trend[this.metric.trend.length - 1];
    
    if (last > first) return 'up';
    if (last < first) return 'down';
    return 'neutral';
  }
}
