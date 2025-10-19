import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../core/services/dialog.service';

interface Transaction {
  id: number;
  type: 'sale' | 'purchase' | 'return';
  customer: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending' | 'cancelled';
  items: number;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];

  ngOnInit(): void {
    this.transactions = [
      {
        id: 1,
        type: 'sale',
        customer: 'Ana Silva',
        amount: 1250.50,
        date: new Date('2024-01-15'),
        status: 'completed',
        items: 3
      },
      {
        id: 2,
        type: 'purchase',
        customer: 'Tech Solutions Ltda',
        amount: 2500.00,
        date: new Date('2024-01-14'),
        status: 'completed',
        items: 5
      },
      {
        id: 3,
        type: 'sale',
        customer: 'Carlos Santos',
        amount: 890.75,
        date: new Date('2024-01-13'),
        status: 'pending',
        items: 2
      },
      {
        id: 4,
        type: 'return',
        customer: 'Maria Costa',
        amount: 299.90,
        date: new Date('2024-01-12'),
        status: 'completed',
        items: 1
      }
    ];
  }

  getTypeText(type: string): string {
    switch (type) {
      case 'sale': return 'Venda';
      case 'purchase': return 'Compra';
      case 'return': return 'Devolução';
      default: return type;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  viewTransaction(transaction: Transaction): void {
    console.log('Visualizando transação:', transaction);
    // TODO: Implementar modal de visualização
  }

  editTransaction(transaction: Transaction): void {
    console.log('Editando transação:', transaction);
    // TODO: Implementar modal de edição
  }

  cancelTransaction(transaction: Transaction): void {
    if (confirm(`Tem certeza que deseja cancelar a transação #${transaction.id}?`)) {
      transaction.status = 'cancelled';
      console.log('Transação cancelada:', transaction);
    }
  }
}
