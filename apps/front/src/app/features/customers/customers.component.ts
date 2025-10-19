import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="customers">
      <h1>Clientes</h1>
      <p>Gerenciamento de clientes em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .customers {
      padding: 2rem;
    }
    
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
  `]
})
export class CustomersComponent {}
