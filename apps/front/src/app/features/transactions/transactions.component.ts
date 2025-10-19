import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transactions">
      <h1>Transações</h1>
      <p>Gerenciamento de transações em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .transactions {
      padding: 2rem;
    }
    
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
  `]
})
export class TransactionsComponent {}
