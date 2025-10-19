import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../core/services/dialog.service';

interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  productCount: number;
  isActive: boolean;
}

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    this.suppliers = [
      {
        id: 1,
        name: 'Tech Solutions Ltda',
        contact: 'João Silva',
        email: 'joao@techsolutions.com',
        phone: '(11) 99999-9999',
        address: 'São Paulo, SP',
        productCount: 45,
        isActive: true
      },
      {
        id: 2,
        name: 'Electronics Corp',
        contact: 'Maria Santos',
        email: 'maria@electronics.com',
        phone: '(11) 88888-8888',
        address: 'Rio de Janeiro, RJ',
        productCount: 32,
        isActive: true
      },
      {
        id: 3,
        name: 'Gadget World',
        contact: 'Pedro Costa',
        email: 'pedro@gadgetworld.com',
        phone: '(11) 77777-7777',
        address: 'Belo Horizonte, MG',
        productCount: 18,
        isActive: false
      }
    ];
  }

  editSupplier(supplier: Supplier): void {
    console.log('Editando fornecedor:', supplier);
    // TODO: Implementar modal de edição
  }

  viewProducts(supplier: Supplier): void {
    console.log('Visualizando produtos do fornecedor:', supplier);
    // TODO: Navegar para página de produtos filtrados por fornecedor
  }

  deleteSupplier(supplier: Supplier): void {
    this.dialogService.confirmDelete(supplier.name, 'fornecedor').subscribe(result => {
      if (result.confirmed) {
        this.suppliers = this.suppliers.filter(s => s.id !== supplier.id);
        console.log('Fornecedor excluído:', supplier);
      }
    });
  }
}
