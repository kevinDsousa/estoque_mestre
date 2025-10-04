import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@estoquemestre.com' },
    update: {},
    create: {
      email: 'admin@estoquemestre.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      firstName: 'Super',
      lastName: 'Admin',
      emailVerified: true,
      canCreateUsers: true,
      canDeleteUsers: true,
      canManageProducts: true,
      canManageCategories: true,
      canManageInventory: true,
      canViewReports: true,
      canManageCompany: true,
      canManageSuppliers: true,
      canManageCustomers: true,
    },
  });

  console.log('✅ Super admin user created:', superAdmin.email);

  // Create default company for testing
  const defaultCompany = await prisma.company.upsert({
    where: { document: '12.345.678/0001-90' },
    update: {},
    create: {
      name: 'Auto Peças Exemplo',
      legalName: 'Auto Peças Exemplo Ltda',
      document: '12.345.678/0001-90',
      type: 'AUTO_PARTS',
      status: 'ACTIVE',
      street: 'Rua das Peças',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
      email: 'contato@autopecasexemplo.com',
      phone: '(11) 99999-9999',
      website: 'https://autopecasexemplo.com',
    },
  });

  console.log('✅ Default company created:', defaultCompany.name);

  // Create admin user for the company
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'admin@autopecasexemplo.com' },
    update: {},
    create: {
      email: 'admin@autopecasexemplo.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      firstName: 'Admin',
      lastName: 'Empresa',
      companyId: defaultCompany.id,
      emailVerified: true,
      canCreateUsers: true,
      canDeleteUsers: false,
      canManageProducts: true,
      canManageCategories: true,
      canManageInventory: true,
      canViewReports: true,
      canManageCompany: true,
      canManageSuppliers: true,
      canManageCustomers: true,
    },
  });

  console.log('✅ Company admin user created:', companyAdmin.email);

  // Create default categories
  const categories = [
    {
      name: 'Motor',
      slug: 'motor',
      description: 'Peças e componentes do motor',
      level: 0,
      path: [],
      fullPath: 'Motor',
    },
    {
      name: 'Freios',
      slug: 'freios',
      description: 'Sistema de freios',
      level: 0,
      path: [],
      fullPath: 'Freios',
    },
    {
      name: 'Suspensão',
      slug: 'suspensao',
      description: 'Sistema de suspensão',
      level: 0,
      path: [],
      fullPath: 'Suspensão',
    },
    {
      name: 'Elétrica',
      slug: 'eletrica',
      description: 'Sistema elétrico',
      level: 0,
      path: [],
      fullPath: 'Elétrica',
    },
    {
      name: 'Filtros',
      slug: 'filtros',
      description: 'Filtros diversos',
      level: 0,
      path: [],
      fullPath: 'Filtros',
    },
  ];

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { 
        companyId_slug: {
          companyId: defaultCompany.id,
          slug: categoryData.slug,
        }
      },
      update: {},
      create: {
        ...categoryData,
        companyId: defaultCompany.id,
        status: 'ACTIVE',
        keywords: [categoryData.name.toLowerCase()],
      },
    });
    console.log('✅ Category created:', category.name);
  }

  // Create default supplier
  const defaultSupplier = await prisma.supplier.upsert({
    where: { 
      companyId_document: {
        companyId: defaultCompany.id,
        document: '98.765.432/0001-10',
      }
    },
    update: {},
    create: {
      name: 'Fornecedor Exemplo',
      legalName: 'Fornecedor Exemplo Ltda',
      document: '98.765.432/0001-10',
      type: 'MANUFACTURER',
      status: 'ACTIVE',
      companyId: defaultCompany.id,
      contacts: [
        {
          name: 'João Silva',
          email: 'joao@fornecedorexemplo.com',
          phone: '(11) 88888-8888',
          position: 'Vendedor',
          isPrimary: true,
        }
      ],
      addresses: [
        {
          street: 'Rua do Fornecedor',
          number: '456',
          neighborhood: 'Industrial',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '04567-890',
          country: 'Brasil',
          isMainAddress: true,
        }
      ],
      paymentMethod: 'CREDIT',
      creditLimit: 50000,
      paymentDays: 30,
      discountPercentage: 5,
      discountDays: 10,
      isPreferred: true,
    },
  });

  console.log('✅ Default supplier created:', defaultSupplier.name);

  // Create default customer
  const defaultCustomer = await prisma.customer.upsert({
    where: { 
      companyId_document: {
        companyId: defaultCompany.id,
        document: '123.456.789-00',
      }
    },
    update: {},
    create: {
      name: 'Cliente Exemplo',
      document: '123.456.789-00',
      type: 'INDIVIDUAL',
      status: 'ACTIVE',
      companyId: defaultCompany.id,
      contacts: [
        {
          name: 'Maria Santos',
          email: 'maria@email.com',
          phone: '(11) 77777-7777',
          isPrimary: true,
        }
      ],
      addresses: [
        {
          street: 'Rua do Cliente',
          number: '789',
          neighborhood: 'Residencial',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '07890-123',
          country: 'Brasil',
          isMainAddress: true,
          type: 'BOTH',
        }
      ],
      preferredPaymentMethod: 'PIX',
      isVip: false,
    },
  });

  console.log('✅ Default customer created:', defaultCustomer.name);

  // Create sample products
  const motorCategory = await prisma.category.findFirst({
    where: { companyId: defaultCompany.id, slug: 'motor' },
  });

  if (motorCategory) {
    const sampleProducts = [
      {
        name: 'Filtro de Óleo',
        sku: 'FIL-001',
        barcode: '7891234567890',
        type: 'AUTO_PART' as any,
        categoryId: motorCategory.id,
        supplierId: defaultSupplier.id,
        costPrice: 25.00,
        sellingPrice: 45.00,
        currentStock: 50,
        minStock: 10,
        maxStock: 100,
        brand: 'Marca A',
        specifications: [
          { key: 'Aplicação', value: 'Motor 1.0', unit: '' },
          { key: 'Material', value: 'Papel', unit: '' },
        ],
        images: [
          {
            url: 'https://example.com/filtro-oleo.jpg',
            alt: 'Filtro de Óleo',
            isPrimary: true,
            order: 0,
          }
        ],
        slug: 'filtro-de-oleo',
        keywords: ['filtro', 'óleo', 'motor'],
      },
      {
        name: 'Vela de Ignição',
        sku: 'VEL-001',
        barcode: '7891234567891',
        type: 'AUTO_PART' as any,
        categoryId: motorCategory.id,
        supplierId: defaultSupplier.id,
        costPrice: 15.00,
        sellingPrice: 28.00,
        currentStock: 30,
        minStock: 5,
        maxStock: 50,
        brand: 'Marca B',
        specifications: [
          { key: 'Gap', value: '0.8', unit: 'mm' },
          { key: 'Rosca', value: 'M14x1.25', unit: '' },
        ],
        images: [
          {
            url: 'https://example.com/vela-ignicao.jpg',
            alt: 'Vela de Ignição',
            isPrimary: true,
            order: 0,
          }
        ],
        slug: 'vela-de-ignicao',
        keywords: ['vela', 'ignição', 'motor'],
      },
    ];

    for (const productData of sampleProducts) {
      const product = await prisma.product.upsert({
        where: { 
          companyId_sku: {
            companyId: defaultCompany.id,
            sku: productData.sku,
          }
        },
        update: {},
        create: {
          ...productData,
          companyId: defaultCompany.id,
          status: 'ACTIVE',
        },
      });
      console.log('✅ Sample product created:', product.name);
    }
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
