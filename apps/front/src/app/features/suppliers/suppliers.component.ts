import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="suppliers">
      <h1>Fornecedores</h1>
      <p>Gerenciamento de fornecedores em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .suppliers {
      padding: 2rem;
    }
    
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
  `]
})
export class SuppliersComponent {}
