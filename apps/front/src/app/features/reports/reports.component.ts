import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports">
      <h1>Relatórios</h1>
      <p>Gerenciamento de relatórios em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .reports {
      padding: 2rem;
    }
    
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
  `]
})
export class ReportsComponent {}
