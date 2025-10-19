import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="products">
      <h1>Produtos</h1>
      <p>Gerenciamento de produtos em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .products {
      padding: 2rem;
    }
    
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
  `]
})
export class ProductsComponent {}
