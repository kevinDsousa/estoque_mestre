# Estoque Mestre Models

Este pacote contém todos os modelos, DTOs, interfaces e views compartilhados para o sistema de gerenciamento de estoque Estoque Mestre.

## Estrutura

```
src/
├── interfaces/          # Interfaces base do sistema
│   ├── base.interface.ts
│   ├── user.interface.ts
│   ├── company.interface.ts
│   ├── product.interface.ts
│   ├── category.interface.ts
│   ├── supplier.interface.ts
│   ├── customer.interface.ts
│   ├── transaction.interface.ts
│   └── index.ts
├── entity/             # Entidades do domínio
│   ├── user.entity.ts
│   ├── company.entity.ts
│   ├── product.entity.ts
│   ├── category.entity.ts
│   ├── supplier.entity.ts
│   ├── customer.entity.ts
│   ├── transaction.entity.ts
│   ├── inventory-movement.entity.ts
│   ├── audit-log.entity.ts
│   └── index.ts
├── dto/                # DTOs de request e response
│   ├── request/        # DTOs de entrada com validação Zod
│   │   ├── user.request.dto.ts
│   │   ├── company.request.dto.ts
│   │   ├── product.request.dto.ts
│   │   ├── category.request.dto.ts
│   │   ├── supplier.request.dto.ts
│   │   ├── customer.request.dto.ts
│   │   ├── transaction.request.dto.ts
│   │   └── index.ts
│   ├── response/       # DTOs de saída
│   │   ├── user.response.dto.ts
│   │   ├── company.response.dto.ts
│   │   ├── product.response.dto.ts
│   │   ├── category.response.dto.ts
│   │   ├── supplier.response.dto.ts
│   │   ├── customer.response.dto.ts
│   │   ├── transaction.response.dto.ts
│   │   └── index.ts
│   └── index.ts
├── view/               # Model views para apresentação
│   ├── dashboard.view.ts
│   ├── report.view.ts
│   ├── analytics.view.ts
│   ├── notification.view.ts
│   └── index.ts
└── index.ts           # Exportações principais
```

## Características

### 🏗️ Arquitetura Modular
- **Interfaces**: Definem contratos e tipos base
- **Entidades**: Representam objetos de domínio com lógica de negócio
- **DTOs**: Transferem dados entre camadas com validação
- **Views**: Modelam dados para apresentação e relatórios

### 🔒 Sistema de Permissões
- **SUPER_ADMIN**: Acesso total ao sistema
- **ADMIN**: Administrador da empresa (apenas um por empresa)
- **MANAGER**: Gerenciador com permissões específicas

### 🏢 Multi-tenant
- Cada empresa tem seus próprios dados isolados
- Usuários vinculados a empresas específicas
- SUPER_ADMIN pode gerenciar todas as empresas

### 🚗 Foco em Autopeças
- Modelos específicos para compatibilidade de veículos
- Categorias hierárquicas para organização
- Especificações técnicas detalhadas

### 📊 Sistema Completo
- **Produtos**: Gestão completa de inventário
- **Fornecedores**: Avaliação e termos de pagamento
- **Clientes**: Segmentação e histórico
- **Transações**: Vendas, compras e movimentações
- **Relatórios**: Analytics e dashboards
- **Notificações**: Sistema de alertas

## Uso

### Instalação
```bash
npm install @estoque-mestre/models
```

### Exemplo de Uso
```typescript
import { 
  CreateProductRequestSchema, 
  ProductResponseSchema,
  UserRole,
  ProductType 
} from '@estoque-mestre/models';

// Validação de entrada
const productData = CreateProductRequestSchema.parse({
  name: 'Filtro de Óleo',
  sku: 'FIL-001',
  type: ProductType.AUTO_PART,
  // ... outros campos
});

// Resposta tipada
const productResponse: ProductResponseSchema = {
  id: 'uuid',
  name: 'Filtro de Óleo',
  // ... outros campos
};
```

## Validação

Todos os DTOs de request utilizam **Zod** para validação:

```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
});

const data = schema.parse(input); // Valida e retorna dados tipados
```

## Banco de Dados

O schema Prisma está localizado em `apps/api/prisma/schema.prisma` e inclui:

- **Relacionamentos** completos entre entidades
- **Índices** para performance
- **Constraints** de integridade
- **Enums** para valores padronizados
- **Auditoria** automática com timestamps

## Scripts Disponíveis

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Aplicar mudanças no banco
npm run prisma:push

# Criar migração
npm run prisma:migrate

# Popular banco com dados iniciais
npm run prisma:seed

# Abrir Prisma Studio
npm run prisma:studio
```

## Contribuição

1. Mantenha a consistência nos tipos
2. Adicione validações Zod apropriadas
3. Documente interfaces complexas
4. Teste mudanças no schema Prisma
5. Atualize este README quando necessário
