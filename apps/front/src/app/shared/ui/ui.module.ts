import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import our custom PrimeNG module
import { SimplePrimeNGModule } from '@estoque-mestre/primeng-ui';

/**
 * Módulo UI compartilhado para o frontend
 * 
 * Este módulo importa e configura todos os componentes UI
 * necessários para o sistema Estoque Mestre.
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SimplePrimeNGModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SimplePrimeNGModule
  ]
})
export class UiModule { }
