import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalTransactions: number;
  lowStockProducts: number;
  pendingOrders: number;
  monthlyRevenue: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalProducts: 1247,
    totalCategories: 23,
    totalSuppliers: 45,
    totalCustomers: 892,
    totalTransactions: 3421,
    lowStockProducts: 12,
    pendingOrders: 8,
    monthlyRevenue: 125430.50
  };

  ngOnInit(): void {
    // Aqui você pode carregar dados reais da API
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // TODO: Implementar carregamento de dados da API
    console.log('Carregando dados do dashboard...');
  }
}
