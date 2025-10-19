import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'polarArea' | 'radar';

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  pointRadius?: number;
  pointHoverRadius?: number;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
    tooltip?: {
      enabled?: boolean;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
      beginAtZero?: boolean;
    };
  };
  animation?: {
    duration?: number;
  };
}

export interface ChartPeriod {
  label: string;
  value: string;
  days?: number;
}

export interface EstoqueChartInputs {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  title?: string;
  subtitle?: string;
  loading: boolean;
  showPeriodSelector: boolean;
  periods: ChartPeriod[];
  selectedPeriod: string;
  showExportButton: boolean;
  showFullscreenButton: boolean;
  height: string;
  width: string;
}

export interface EstoqueChartOutputs {
  onPeriodChange: EventEmitter<string>;
  onExport: EventEmitter<{ format: string; data: ChartData }>;
  onFullscreen: EventEmitter<void>;
  onDataClick: EventEmitter<{ event: any; elements: any[] }>;
}

/**
 * Componente de gráficos para Estoque Mestre
 * 
 * Componente wrapper para Chart.js com funcionalidades específicas do sistema
 * como seleção de período, exportação e temas customizados
 * 
 * @example
 * ```html
 * <estoque-chart 
 *   type="line"
 *   [data]="chartData"
 *   title="Vendas por Mês"
 *   [showPeriodSelector]="true"
 *   [periods]="periods"
 *   (onPeriodChange)="onPeriodChange($event)"
 *   (onExport)="onExport($event)">
 * </estoque-chart>
 * ```
 */
@Component({
  selector: 'estoque-chart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    SkeletonModule,
    TooltipModule
  ],
  templateUrl: './estoque-chart.component.html',
  styleUrls: ['./estoque-chart.component.scss']
})
export class EstoqueChartComponent implements OnInit, OnDestroy, EstoqueChartInputs, EstoqueChartOutputs {
  @Input() type: ChartType = 'line';
  @Input() data: ChartData = { labels: [], datasets: [] };
  @Input() options?: ChartOptions;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() loading: boolean = false;
  @Input() showPeriodSelector: boolean = false;
  @Input() periods: ChartPeriod[] = [];
  @Input() selectedPeriod: string = '';
  @Input() showExportButton: boolean = false;
  @Input() showFullscreenButton: boolean = false;
  @Input() height: string = '400px';
  @Input() width: string = '100%';

  @Output() onPeriodChange = new EventEmitter<string>();
  @Output() onExport = new EventEmitter<{ format: string; data: ChartData }>();
  @Output() onFullscreen = new EventEmitter<void>();
  @Output() onDataClick = new EventEmitter<{ event: any; elements: any[] }>();

  chartOptions: ChartOptions = {};
  isFullscreen: boolean = false;

  ngOnInit(): void {
    this.initializeChartOptions();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: !!this.title,
          text: this.title
        },
        tooltip: {
          enabled: true
        }
      },
      animation: {
        duration: 1000
      },
      ...this.options
    };

    // Add scales for line and bar charts
    if (this.type === 'line' || this.type === 'bar') {
      this.chartOptions.scales = {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Período'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Valor'
          },
          beginAtZero: true
        },
        ...this.options?.scales
      };
    }
  }

  onPeriodChangeHandler(period: string): void {
    this.selectedPeriod = period;
    this.onPeriodChange.emit(period);
  }

  onExportHandler(format: string): void {
    this.onExport.emit({
      format,
      data: this.data
    });
  }

  onFullscreenHandler(): void {
    this.isFullscreen = !this.isFullscreen;
    this.onFullscreen.emit();
  }

  onDataClickHandler(event: any): void {
    this.onDataClick.emit(event);
  }

  // Utility methods for common chart configurations
  static createLineChartData(labels: string[], datasets: Omit<ChartDataset, 'data'>[], data: number[][]): ChartData {
    return {
      labels,
      datasets: datasets.map((dataset, index) => ({
        ...dataset,
        data: data[index] || [],
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }))
    };
  }

  static createBarChartData(labels: string[], datasets: Omit<ChartDataset, 'data'>[], data: number[][]): ChartData {
    return {
      labels,
      datasets: datasets.map((dataset, index) => ({
        ...dataset,
        data: data[index] || [],
        borderWidth: 1
      }))
    };
  }

  static createPieChartData(labels: string[], data: number[], colors?: string[]): ChartData {
    return {
      labels,
      datasets: [{
        label: 'Dados',
        data,
        backgroundColor: colors || this.getDefaultColors(data.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  static getDefaultColors(count: number): string[] {
    const colors = [
      '#1a237e', // Primary blue
      '#ffab00', // Secondary amber
      '#4caf50', // Success green
      '#f44336', // Error red
      '#2196f3', // Info blue
      '#ff9800', // Warning orange
      '#9c27b0', // Purple
      '#00bcd4', // Cyan
      '#795548', // Brown
      '#607d8b'  // Blue grey
    ];
    
    return colors.slice(0, count);
  }

  static getDefaultPeriods(): ChartPeriod[] {
    return [
      { label: 'Hoje', value: 'today', days: 1 },
      { label: 'Últimos 7 dias', value: 'week', days: 7 },
      { label: 'Últimos 30 dias', value: 'month', days: 30 },
      { label: 'Últimos 90 dias', value: 'quarter', days: 90 },
      { label: 'Último ano', value: 'year', days: 365 }
    ];
  }

  // Getters
  get chartHeight(): string {
    return this.isFullscreen ? '100vh' : this.height;
  }

  get chartWidth(): string {
    return this.isFullscreen ? '100vw' : this.width;
  }

  get hasData(): boolean {
    return this.data && this.data.labels && this.data.labels.length > 0;
  }

  get isEmpty(): boolean {
    return !this.hasData || this.data.datasets.every(dataset => 
      dataset.data.every(value => value === 0)
    );
  }

  getDatasetColor(dataset: ChartDataset, index: number): string {
    if (dataset.backgroundColor) {
      if (Array.isArray(dataset.backgroundColor)) {
        return dataset.backgroundColor[0] || EstoqueChartComponent.getDefaultColors(1)[0];
      }
      return dataset.backgroundColor;
    }
    return EstoqueChartComponent.getDefaultColors(index + 1)[index];
  }

  getTotalValue(): number {
    if (!this.hasData) return 0;
    
    return this.data.datasets.reduce((total, dataset) => {
      return total + dataset.data.reduce((sum, value) => sum + value, 0);
    }, 0);
  }

  getAverageValue(): number {
    if (!this.hasData) return 0;
    
    const totalValue = this.getTotalValue();
    const totalDataPoints = this.data.datasets.reduce((total, dataset) => total + dataset.data.length, 0);
    
    return totalDataPoints > 0 ? totalValue / totalDataPoints : 0;
  }

  getMaxValue(): number {
    if (!this.hasData) return 0;
    
    let maxValue = 0;
    this.data.datasets.forEach(dataset => {
      const datasetMax = Math.max(...dataset.data);
      if (datasetMax > maxValue) {
        maxValue = datasetMax;
      }
    });
    
    return maxValue;
  }
}
