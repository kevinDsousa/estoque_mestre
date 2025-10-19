import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="categories">
      <h1>Categorias</h1>
      <p>Gerenciamento de categorias em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .categories {
      padding: 2rem;
    }
    
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
  `]
})
export class CategoriesComponent {}
