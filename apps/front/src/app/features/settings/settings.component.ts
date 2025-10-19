import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings">
      <h1>Configurações</h1>
      <p>Configurações do sistema em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .settings {
      padding: 2rem;
    }
    
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
  `]
})
export class SettingsComponent {}
