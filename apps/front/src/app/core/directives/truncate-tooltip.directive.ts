import { Directive, ElementRef, Input, OnInit, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appTruncateTooltip]',
  standalone: true
})
export class TruncateTooltipDirective implements OnInit {
  @Input() maxLength: number = 20;
  @Input() appTruncateTooltip: string = '';
  
  private originalText: string = '';
  private tooltipElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Pega o texto original do elemento ou do input
    this.originalText = this.appTruncateTooltip || this.el.nativeElement.textContent.trim();
    
    // Se o texto for maior que maxLength, trunca e adiciona ...
    if (this.originalText.length > this.maxLength) {
      const truncated = this.originalText.substring(0, this.maxLength) + '...';
      this.renderer.setProperty(this.el.nativeElement, 'textContent', truncated);
      
      // Adiciona cursor pointer para indicar que tem tooltip
      this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
      
      // Adiciona title como fallback
      this.renderer.setAttribute(this.el.nativeElement, 'title', this.originalText);
    }
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent) {
    if (this.originalText.length > this.maxLength) {
      this.showTooltip(event);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.hideTooltip();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.tooltipElement) {
      this.positionTooltip(event);
    }
  }

  private showTooltip(event: MouseEvent) {
    // Cria o elemento tooltip
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'custom-tooltip');
    
    // Adiciona o texto
    const textNode = this.renderer.createText(this.originalText);
    this.renderer.appendChild(this.tooltipElement, textNode);
    
    // Adiciona estilos
    this.renderer.setStyle(this.tooltipElement, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipElement, 'background', 'var(--surface-900)');
    this.renderer.setStyle(this.tooltipElement, 'color', 'white');
    this.renderer.setStyle(this.tooltipElement, 'padding', '8px 12px');
    this.renderer.setStyle(this.tooltipElement, 'border-radius', '6px');
    this.renderer.setStyle(this.tooltipElement, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '10000');
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipElement, 'max-width', '300px');
    this.renderer.setStyle(this.tooltipElement, 'word-wrap', 'break-word');
    this.renderer.setStyle(this.tooltipElement, 'box-shadow', '0 4px 6px rgba(0, 0, 0, 0.3)');
    this.renderer.setStyle(this.tooltipElement, 'white-space', 'normal');
    
    // Adiciona ao body
    this.renderer.appendChild(document.body, this.tooltipElement);
    
    // Posiciona
    this.positionTooltip(event);
  }

  private positionTooltip(event: MouseEvent) {
    if (!this.tooltipElement) return;
    
    const offset = 10;
    let top = event.clientY + offset;
    let left = event.clientX + offset;
    
    // Verifica se o tooltip vai sair da tela
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Ajusta posição horizontal se necessário
    if (left + tooltipRect.width > viewportWidth) {
      left = event.clientX - tooltipRect.width - offset;
    }
    
    // Ajusta posição vertical se necessário
    if (top + tooltipRect.height > viewportHeight) {
      top = event.clientY - tooltipRect.height - offset;
    }
    
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}

