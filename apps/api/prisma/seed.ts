import { PrismaClient, UserRole, CompanyStatus, ProductStatus, TransactionType, TransactionStatus, MovementType, MovementReason } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Company
  console.log('📊 Creating company...');
  const company = await prisma.company.create({
    data: {
      name: 'TechStore Ltda',
      legalName: 'TechStore Tecnologia Ltda',
      document: '12.345.678/0001-90',
      type: 'GENERAL_RETAIL',
      email: 'contato@techstore.com',
      phone: '(11) 99999-9999',
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
      status: CompanyStatus.APPROVED,
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      language: 'pt-BR'
    }
  });

  // 2. Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@techstore.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      phone: '(11) 99999-9999',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      companyId: company.id,
      emailVerified: true
    }
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'gerente@techstore.com',
      password: hashedPassword,
      firstName: 'João',
      lastName: 'Silva',
      phone: '(11) 88888-8888',
      role: UserRole.MANAGER,
      status: 'ACTIVE',
      companyId: company.id,
      emailVerified: true
    }
  });

  const employeeUser = await prisma.user.create({
    data: {
      email: 'funcionario@techstore.com',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Santos',
      phone: '(11) 77777-7777',
      role: UserRole.EMPLOYEE,
      status: 'ACTIVE',
      companyId: company.id,
      emailVerified: true
    }
  });

  // 3. Create Categories
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Eletrônicos',
        description: 'Dispositivos eletrônicos e gadgets',
        slug: 'eletronicos',
        status: 'ACTIVE',
        companyId: company.id,
        fullPath: 'Eletrônicos'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Informática',
        description: 'Computadores, periféricos e acessórios',
        slug: 'informatica',
        status: 'ACTIVE',
        companyId: company.id,
        fullPath: 'Informática'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Casa e Jardim',
        description: 'Itens para casa, decoração e jardinagem',
        slug: 'casa-e-jardim',
        status: 'ACTIVE',
        companyId: company.id,
        fullPath: 'Casa e Jardim'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Esportes',
        description: 'Equipamentos e vestuário esportivo',
        slug: 'esportes',
        status: 'ACTIVE',
        companyId: company.id,
        fullPath: 'Esportes'
      }
    })
  ]);

  // 4. Create Suppliers
  console.log('🏭 Creating suppliers...');
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Tech Solutions Ltda',
        document: '12.345.678/0001-90',
        type: 'DISTRIBUTOR',
        status: 'ACTIVE',
        contacts: [
          {
            name: 'João Silva',
            email: 'joao@techsolutions.com',
            phone: '(11) 99999-9999',
            role: 'Gerente de Vendas'
          }
        ],
        addresses: [
          {
            street: 'Rua da Tecnologia',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
            country: 'Brasil',
            isDefault: true
          }
        ],
        companyId: company.id
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Electronics Corp',
        document: '98.765.432/0001-10',
        type: 'MANUFACTURER',
        status: 'ACTIVE',
        contacts: [
          {
            name: 'Maria Santos',
            email: 'maria@electronics.com',
            phone: '(11) 88888-8888',
            role: 'Representante Comercial'
          }
        ],
        addresses: [
          {
            street: 'Av. Comercial',
            number: '456',
            neighborhood: 'Centro',
            city: 'Rio de Janeiro',
            state: 'RJ',
            zipCode: '20000-000',
            country: 'Brasil',
            isDefault: true
          }
        ],
        companyId: company.id
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Gadget World',
        document: '11.222.333/0001-44',
        type: 'WHOLESALER',
        status: 'INACTIVE',
        contacts: [
          {
            name: 'Pedro Costa',
            email: 'pedro@gadgetworld.com',
            phone: '(11) 77777-7777',
            role: 'Vendedor'
          }
        ],
        addresses: [
          {
            street: 'Travessa da Eletricidade',
            number: '789',
            neighborhood: 'Industrial',
            city: 'Belo Horizonte',
            state: 'MG',
            zipCode: '30000-000',
            country: 'Brasil',
            isDefault: true
          }
        ],
        companyId: company.id
      }
    })
  ]);

  // 5. Create Customers
  console.log('👥 Creating customers...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Ana Silva',
        document: '123.456.789-00',
        type: 'INDIVIDUAL',
        status: 'ACTIVE',
        contacts: [
          {
            name: 'Ana Silva',
            email: 'ana@email.com',
            phone: '(11) 99999-1111',
            role: 'Cliente'
          }
        ],
        addresses: [
          {
            street: 'Rua das Flores',
            number: '100',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
            country: 'Brasil',
            isDefault: true
          }
        ],
        companyId: company.id
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Carlos Santos',
        document: '987.654.321-00',
        type: 'INDIVIDUAL',
        status: 'ACTIVE',
        contacts: [
          {
            name: 'Carlos Santos',
            email: 'carlos@email.com',
            phone: '(11) 88888-2222',
            role: 'Cliente'
          }
        ],
        addresses: [
          {
            street: 'Av. Paulista',
            number: '200',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-000',
            country: 'Brasil',
            isDefault: true
          }
        ],
        companyId: company.id
      }
    }),
    prisma.customer.create({
      data: {
        name: 'Maria Costa',
        document: '456.789.123-00',
        type: 'INDIVIDUAL',
        status: 'ACTIVE',
        contacts: [
          {
            name: 'Maria Costa',
            email: 'maria@email.com',
            phone: '(11) 77777-3333',
            role: 'Cliente'
          }
        ],
        addresses: [
          {
            street: 'Rua Augusta',
            number: '300',
            neighborhood: 'Consolação',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01305-000',
            country: 'Brasil',
            isDefault: true
          }
        ],
        companyId: company.id
      }
    })
  ]);

  // 6. Create Products
  console.log('📦 Creating products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Notebook Dell Inspiron 15',
        description: 'Notebook Dell Inspiron 15 3000, Intel Core i5, 8GB RAM, 256GB SSD',
        sku: 'DELL-INS15-001',
        barcode: '1234567890123',
        type: 'ACCESSORY',
        categoryId: categories[1].id, // Informática
        supplierId: suppliers[0].id,
        costPrice: 2000.00,
        sellingPrice: 2500.00,
        currentStock: 15,
        minStock: 5,
        maxStock: 50,
        status: ProductStatus.ACTIVE,
        slug: 'notebook-dell-inspiron-15',
        specifications: [
          { name: 'Processador', value: 'Intel Core i5' },
          { name: 'RAM', value: '8GB' },
          { name: 'Armazenamento', value: '256GB SSD' },
          { name: 'Tela', value: '15.6 polegadas' }
        ],
        companyId: company.id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Mouse sem fio Logitech',
        description: 'Mouse sem fio Logitech MX Master 3, recarregável',
        sku: 'LOG-MX3-002',
        barcode: '1234567890124',
        type: 'ACCESSORY',
        categoryId: categories[1].id, // Informática
        supplierId: suppliers[0].id,
        costPrice: 60.00,
        sellingPrice: 89.90,
        currentStock: 3,
        minStock: 10,
        maxStock: 100,
        status: ProductStatus.ACTIVE,
        slug: 'mouse-sem-fio-logitech',
        specifications: [
          { name: 'Tipo', value: 'Sem fio' },
          { name: 'DPI', value: '4000' },
          { name: 'Bateria', value: 'Recarregável' },
          { name: 'Conexão', value: 'Bluetooth' }
        ],
        companyId: company.id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Teclado Mecânico RGB',
        description: 'Teclado mecânico RGB com switches azuis',
        sku: 'MECH-KB-003',
        barcode: '1234567890125',
        type: 'ACCESSORY',
        categoryId: categories[1].id, // Informática
        supplierId: suppliers[1].id,
        costPrice: 200.00,
        sellingPrice: 299.90,
        currentStock: 25,
        minStock: 5,
        maxStock: 50,
        status: ProductStatus.ACTIVE,
        slug: 'teclado-mecanico-rgb',
        specifications: [
          { name: 'Tipo', value: 'Mecânico' },
          { name: 'Switch', value: 'Azul' },
          { name: 'Iluminação', value: 'RGB' },
          { name: 'Layout', value: 'QWERTY' }
        ],
        companyId: company.id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Monitor 24" Full HD',
        description: 'Monitor LED 24 polegadas Full HD 1920x1080',
        sku: 'MON-24FHD-004',
        barcode: '1234567890126',
        type: 'ACCESSORY',
        categoryId: categories[1].id, // Informática
        supplierId: suppliers[1].id,
        costPrice: 600.00,
        sellingPrice: 899.90,
        currentStock: 8,
        minStock: 3,
        maxStock: 20,
        status: ProductStatus.ACTIVE,
        slug: 'monitor-24-full-hd',
        specifications: [
          { name: 'Tamanho', value: '24 polegadas' },
          { name: 'Resolução', value: '1920x1080' },
          { name: 'Tipo', value: 'LED' },
          { name: 'Conexões', value: 'HDMI, VGA' }
        ],
        companyId: company.id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Smartphone Samsung Galaxy',
        description: 'Smartphone Samsung Galaxy A54 5G, 128GB, 6GB RAM',
        sku: 'SAM-GAL-005',
        barcode: '1234567890127',
        type: 'ACCESSORY',
        categoryId: categories[0].id, // Eletrônicos
        supplierId: suppliers[2].id,
        costPrice: 1200.00,
        sellingPrice: 1899.90,
        currentStock: 0,
        minStock: 2,
        maxStock: 15,
        status: ProductStatus.INACTIVE,
        slug: 'smartphone-samsung-galaxy',
        specifications: [
          { name: 'Modelo', value: 'Galaxy A54 5G' },
          { name: 'Armazenamento', value: '128GB' },
          { name: 'RAM', value: '6GB' },
          { name: 'Sistema', value: 'Android' }
        ],
        companyId: company.id
      }
    })
  ]);

  // 7. Create Stock Movements for initial stock
  console.log('📊 Creating initial stock movements...');
  for (const product of products) {
    if (product.currentStock > 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          type: MovementType.IN,
          reason: MovementReason.PURCHASE,
          quantity: product.currentStock,
          previousStock: 0,
          newStock: product.currentStock,
          unitCost: product.costPrice,
          totalCost: product.costPrice * product.currentStock,
          notes: 'Initial stock from seeding',
          userId: adminUser.id,
          companyId: company.id
        }
      });
    }
  }

  // 8. Create Transactions
  console.log('💳 Creating transactions...');
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        type: TransactionType.SALE,
        customerId: customers[0].id,
        userId: adminUser.id,
        notes: 'Venda de notebook e mouse',
        companyId: company.id
      }
    }),
    prisma.transaction.create({
      data: {
        type: TransactionType.PURCHASE,
        supplierId: suppliers[0].id,
        userId: adminUser.id,
        notes: 'Compra de produtos da Tech Solutions',
        companyId: company.id
      }
    }),
    prisma.transaction.create({
      data: {
        type: TransactionType.SALE,
        customerId: customers[1].id,
        userId: managerUser.id,
        notes: 'Venda pendente de teclado',
        companyId: company.id
      }
    })
  ]);

  // 9. Create Transaction Items
  console.log('📋 Creating transaction items...');
  await Promise.all([
    // Sale transaction items
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[0].id,
        productId: products[0].id,
        quantity: 1,
        unitPrice: products[0].sellingPrice
      }
    }),
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[0].id,
        productId: products[1].id,
        quantity: 1,
        unitPrice: products[1].sellingPrice
      }
    }),
    // Purchase transaction items
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[1].id,
        productId: products[0].id,
        quantity: 1,
        unitPrice: products[0].costPrice
      }
    }),
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[1].id,
        productId: products[1].id,
        quantity: 5,
        unitPrice: products[1].costPrice
      }
    }),
    // Pending sale
    prisma.transactionItem.create({
      data: {
        transactionId: transactions[2].id,
        productId: products[2].id,
        quantity: 1,
        unitPrice: products[2].sellingPrice
      }
    })
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`
📊 Summary:
- Company: 1 (TechStore Ltda)
- Users: 3 (Admin + Manager + Employee)
- Categories: ${categories.length}
- Suppliers: ${suppliers.length}
- Customers: ${customers.length}
- Products: ${products.length}
- Transactions: ${transactions.length}
- Stock Movements: ${products.filter(p => p.currentStock > 0).length}

🔑 Test Credentials:
- Admin: admin@techstore.com / 123456
- Manager: gerente@techstore.com / 123456
- Employee: funcionario@techstore.com / 123456

🏢 Company ID: ${company.id}
📦 Products with low stock: ${products.filter(p => p.currentStock <= p.minStock).length}
💳 Total transactions: ${transactions.length}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
