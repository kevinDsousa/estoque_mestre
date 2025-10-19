import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewMode } from '../../services/view-preferences.service';

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="view-toggle-container">
      <button 
        type="button" 
        class="toggle-btn"
        [class.active]="currentView === 'cards'"
        (click)="toggleView('cards')"
        title="Visualizar em cards">
        <i class="pi pi-th-large"></i>
        <span class="btn-label">Cards</span>
      </button>
      <button 
        type="button" 
        class="toggle-btn"
        [class.active]="currentView === 'table'"
        (click)="toggleView('table')"
        title="Visualizar em tabela">
        <i class="pi pi-list"></i>
        <span class="btn-label">Tabela</span>
      </button>
    </div>
  `,
  styleUrls: ['./view-toggle.component.scss']
})
export class ViewToggleComponent {
  @Input() currentView: ViewMode = 'table';
  @Output() viewChange = new EventEmitter<ViewMode>();

  toggleView(view: ViewMode): void {
    if (this.currentView !== view) {
      this.viewChange.emit(view);
    }
  }
}