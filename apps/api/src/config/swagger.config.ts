export const swaggerConfig = {
  title: 'Estoque Mestre API',
  description: 'API completa para sistema de gestão de estoque para motopeças',
  version: '1.0.0',
  contact: {
    name: 'Estoque Mestre Team',
    email: 'contato@estoquemestre.com',
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT',
  },
  tags: [
    { name: 'auth', description: 'Autenticação e autorização' },
    { name: 'companies', description: 'Gestão de empresas' },
    { name: 'users', description: 'Gestão de usuários' },
    { name: 'products', description: 'Gestão de produtos' },
    { name: 'categories', description: 'Gestão de categorias' },
    { name: 'suppliers', description: 'Gestão de fornecedores' },
    { name: 'customers', description: 'Gestão de clientes' },
    { name: 'transactions', description: 'Transações e movimentações' },
    { name: 'images', description: 'Gestão de imagens' },
    { name: 'payments', description: 'Sistema de pagamentos' },
    { name: 'subscriptions', description: 'Assinaturas' },
    { name: 'reports', description: 'Relatórios e analytics' },
    { name: 'quality', description: 'Controle de qualidade' },
    { name: 'integrations', description: 'Integrações externas' },
    { name: 'webhooks', description: 'Webhooks' },
  ],
  servers: [
    {
      url: 'http://localhost:3003/api',
      description: 'Servidor de desenvolvimento',
    },
    {
      url: 'https://api.estoquemestre.com/api',
      description: 'Servidor de produção',
    },
  ],
};
