import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalPurchases: number;
  lastPurchase: Date;
  isActive: boolean;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];

  ngOnInit(): void {
    this.customers = [
      {
        id: 1,
        name: 'Ana Silva',
        email: 'ana@email.com',
        phone: '(11) 99999-1111',
        address: 'São Paulo, SP',
        totalPurchases: 1250.50,
        lastPurchase: new Date('2024-01-15'),
        isActive: true
      },
      {
        id: 2,
        name: 'Carlos Santos',
        email: 'carlos@email.com',
        phone: '(11) 88888-2222',
        address: 'Rio de Janeiro, RJ',
        totalPurchases: 890.75,
        lastPurchase: new Date('2024-01-10'),
        isActive: true
      },
      {
        id: 3,
        name: 'Maria Costa',
        email: 'maria@email.com',
        phone: '(11) 77777-3333',
        address: 'Belo Horizonte, MG',
        totalPurchases: 2100.00,
        lastPurchase: new Date('2024-01-08'),
        isActive: true
      }
    ];
  }

  editCustomer(customer: Customer): void {
    console.log('Editando cliente:', customer);
    // TODO: Implementar modal de edição
  }

  viewHistory(customer: Customer): void {
    console.log('Visualizando histórico do cliente:', customer);
    // TODO: Navegar para página de histórico de compras
  }

  newSale(customer: Customer): void {
    console.log('Nova venda para cliente:', customer);
    // TODO: Navegar para página de nova venda
  }
}
