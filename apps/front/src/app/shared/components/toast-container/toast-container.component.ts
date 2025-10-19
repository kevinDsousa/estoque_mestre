import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstoqueToastComponent } from '@estoque-mestre/primeng-ui';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, EstoqueToastComponent],
  template: `
    <estoque-toast 
      position="top-right"
      [life]="5000"
      [closable]="true">
    </estoque-toast>
  `
})
export class ToastContainerComponent {}