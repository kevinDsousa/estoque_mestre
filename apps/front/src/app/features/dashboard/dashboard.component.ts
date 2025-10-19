import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aqui você pode carregar dados reais da API
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // TODO: Implementar carregamento de dados da API
    console.log('Carregando dados do dashboard...');
  }

  /**
   * Navega para a página de relatórios
   */
  goToReports(): void {
    this.router.navigate(['/relatorios']);
  }

  /**
   * Navega para a página de produtos com filtro de estoque baixo
   */
  goToLowStockProducts(): void {
    this.router.navigate(['/produtos'], { 
      queryParams: { 
        stockFilter: 'low' 
      } 
    });
  }
}
